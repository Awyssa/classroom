const  Promise = require("bluebird")
	, moment = require("moment")
	, Branch = require("../models/branch.js")
	, request = Promise.promisifyAll(require("request"))
	, bookshelf = require("../bookshelf.js")()
	, masterConfig = require("../config.js")
	, { URLSearchParams } = require("url")
	, superRequest  = require("../super-request.js");

const config =
{
	google_api_key: "AIzaSyC1v3n-ipC-_WI-zbtKKf7Mjsr5SZIOyRA",
	id_url: "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location={{branchY}},{{branchX}}&radius=500&name={{branchName}}&key={{key}}",
	refresh_place_id_url: "https://maps.googleapis.com/maps/api/place/details/json?placeid={{placeId}}&key={{key}}&language=en&fields=place_id",

	envConfig:
	{
		pool: { maxSockets: 1},
		encoding: "UTF8"
	},

	googleReviewType: 6,

	reviewsPerOutscraperBatch: 100,

	outscraperSwitchoverDate: "2022-02-23 00:00:00"

};

// be very vebose with logging in development, but not in production
// const logger = (process.env.NODE_ENV == "production" || process.env.NODE_ENV == "test") ? () =>
// {} : console.log;

// When running locally we will proxy requests to Charles so we can see WTF is going on
// if(process.env.NODE_ENV != "production")
// {

// 	// add SSL certs (so we can man-in-the-middle)
// 	require("ssl-root-cas").inject();

// 	// be chill about TLS validation (so we can man-in-the-middle)
// 	process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";
// 	config.envConfig.rejectUnauthorized = false;

// 	const { SocksProxyAgent } = require("socks-proxy-agent");

// 	config.envConfig.agent = new SocksProxyAgent({
// 		hostname: masterConfig.get("proxy.server"),
// 		port: masterConfig.get("proxy.port")
// 	});
// }


const outscraperApiKey = masterConfig.get("outscraper.key");

const googleImport = {};

const findBranchIdFromGoogle = async(branch) =>
{
	// does this branch have a postcode?
	if(! branch.get("postcode"))
		throw new Error("no_postcode");

	// does this branch have a name?
	if(! branch.get("name"))
		throw new Error("no_branch_name");

	// get outcode & incode
	const checker = new RegExp("^(([A-Z]{1,2}[0-9]{1,2}[A-Z]{0,1})[ ]*([0-9]{1}[A-Z]{2}))$", "i");
	const parts = branch.get("postcode").match(checker);

	if((! parts) || (parts.length != 4))
		throw new Error("invalid_postcode");

	// load longitude and latitude coordinates from the db
	const rows = await bookshelf.knex("postcodes")
	.select("x","y")
	.where({
		outcode: parts[2],
		incode: parts[3]
	});

	// TODO maybe do something else
	if(rows.length != 1)
		throw new Error("postcode_not_found");

	const postCoords = rows[0];

	const envConfig = { ... config.envConfig };

	// create the correct url to send to the Google API
	envConfig.url = config.id_url
	.replace("{{branchY}}", postCoords.y)
	.replace("{{branchX}}", postCoords.x)
	.replace("{{branchName}}", encodeURI(branch.get("name").split("-")[0].trim()))
	.replace("{{key}}", config.google_api_key);

	// search google for branch
	const response = await request.getAsync(envConfig);

	if(response.statusCode != 200)
		throw new Error("google_bad_status");

	const body = response.body;

	let respObj = null;

	// try to json decode
	respObj = JSON.parse(body);

	if((! respObj.results) || (respObj.results.length !== 1))
		return false;

	if(!respObj.results[0].place_id)
		return false;

	// set new Google Place ID as the google id
	return branch.set({"google_id": respObj.results[0].place_id, "last_google_check": null});
};

const googlePlaceIdCheck = (data, branch) =>
{
	// check this result is actually the branch we want to collect the reviews for
	const agentReviewLimit = 1000;
	const totalReviews = data.reviews;

	// if reviews are over the limit, it is most likely not an estate agent
	if(totalReviews >= agentReviewLimit)
		return false;

	if(branch.get("postcode") && data.postal_code)
	{
		const branchPostcode = branch.get("postcode").toLowerCase().replace(/ /g,"");
		const dataPostcode = data.postal_code.toLowerCase().replace(/ /g,"");

		// check the postcodes match, some estate agents don't have postcodes (EweMove), so if null can carry on.
		if( dataPostcode && branchPostcode && ( branchPostcode != dataPostcode ))
			return false;
	}

	return true;
};

const superRequestGetAsync = async(options) =>
{
	const validatorFunc = (response) =>
	{
		if(!response || !response.body)
			return "no response body";

		let resObj;

		try
		{
			resObj = JSON.parse(response.body);
		}
		catch (error)
		{
			return "Response not valid JSON";
		}

		if(resObj.status == "Success")
			return true;

		// return true to stop attempts
		if(resObj.status == "Failure")
			return true;
	};

	// set the timeout amount to wait before attempting another request
	const defaultStepOffFunction = () => 20000;

	// set the amount of attempts we want to try before erroring out.
	const attempts = 10;

	const envConfig = { ...options, ...config.envConfig };

	const res = await superRequest.getAsync(envConfig, validatorFunc, attempts, defaultStepOffFunction, false);

	return res;
};

const reformatOpeningHours = (workingHours) =>
{
	// config to set each weekday to a number
	const days = {
		"Sunday": 0,
		"Monday": 1,
		"Tuesday": 2,
		"Wednesday": 3,
		"Thursday": 4,
		"Friday": 5,
		"Saturday": 6
	};

	const formattedHours = [];
	const hoursArray = Object.entries(workingHours);

	try
	{
		// iterate over each day and push the new format to the formattedHours array
		hoursArray.forEach(e =>
		{
			// if no day, then it is closed
			if(!e || e.length < 1 || e[1] == "Closed" )
				return;

			// set the weekday to the week number
			const getWeekdayToNumber = days[e[0]];

			// the times are in a '9AM–5PM' format, need to split them by the "–" in the middle
			const getWeekdayTimes = e[1].split("–");

			// not the expected format
			if(getWeekdayTimes.length !== 2)
				return;

			// set each weekday number to the correct opening and closing times. Need to format from '9AM' to 24 hour format too.
			const newDate = {
				open: { day: getWeekdayToNumber, time: moment(getWeekdayTimes[0], ["h:mmA", "hA"]).format("HH:mm") },
				close: { day: getWeekdayToNumber, time: moment(getWeekdayTimes[1], ["h:mmA", "hA"]).format("HH:mm") }
			};

			formattedHours.push(newDate);
		});

		return formattedHours;
	}
	catch (error)
	{
		throw new Error("cannot format working hours " + error);
	}
};

const findBranchIdFromOutscraper = async(branch) =>
{
	// Check for postcode, address and name
	if(! branch.get("postcode"))
		throw new Error("no_postcode");

	if(! branch.get("name"))
		throw new Error("no_branch_name");

	// get outcode & incode
	const checker = new RegExp("^(([A-Z]{1,2}[0-9]{1,2}[A-Z]{0,1})[ ]*([0-9]{1}[A-Z]{2}))$", "i");
	const parts = branch.get("postcode").match(checker);

	if((! parts) || (parts.length != 4))
		throw new Error("invalid_postcode");

	// load longitude and latitude coordinates from the db
	const rows = await bookshelf.knex("postcodes")
	.select("x","y")
	.where({
		outcode: parts[2],
		incode: parts[3]
	});

	// TODO maybe do something else
	if(rows.length != 1)
		throw new Error("postcode_not_found");

	const longAndLat = rows[0];

	const mapZoom = "17z";
	const mapQueryCoords = `@${longAndLat.y},${longAndLat.x},${mapZoom}`;

	// setup outscraper API config
	const apiBasepath = "https://api.app.outscraper.com/maps/search";

	// We are only getting the google place_id from outscraper so this doesn't have to be async
	const urlParams = {
		query: branch.get("name").replace(/ /g,"%20").replace("&", "") + " " + branch.get("postcode").replace(/ /g,"") + " real estate agency",
		coordinates: mapQueryCoords,
		limit: 1,
		async: false,
		dropDuplicates: true
	};

	const url = apiBasepath + "?" + (new URLSearchParams(urlParams)).toString();

	const envConfig = {
		url: url,
		headers: { "X-API-KEY": outscraperApiKey },
		method: "GET"
		,
		... config.envConfig
	};

	const response = await request.getAsync(envConfig);

	if(!response || response.statusCode != 200)
		throw new Error("outscraper_bad_status");

	const body = response.body;

	let respObj = null;

	respObj = JSON.parse(body);

	if((! respObj.data) || (! respObj.data.length > 0))
		throw new Error("outscraper_bad_data");

	respObj = respObj.data[0];

	// Check if the the results has a place_id
	if(! respObj.place_id)
	{
		console.log("outscraper_data_no_place_id", respObj.place_id);
		return false;
	}

	const checkPlaceIsLegit = googlePlaceIdCheck(respObj, branch);

	if(!checkPlaceIsLegit)
	{
		console.log("Location is not the matching estate agent", checkPlaceIsLegit);
		return false;
	}

	// set branch id
	return branch.set({"google_id": respObj.place_id, "last_google_check": null});
};


const fetchReviewsFromOutscraper = async(branch, reviewLimit = 100, page = 1, cutoff = null) =>
{
	// if no google id, then no can do
	if(! branch.get("google_id"))
		throw new Error("no_google_id_branch_details");

	console.log("GETTING REVIEWS!");

	const googlePlaceId = branch.get("google_id");

	// Set outscraper API key and baseurl
	const apiBasepath = "https://api.app.outscraper.com/maps/reviews-v3";

	// Config to construct the queries to Outscraper
	// Docs can be found here: https://app.outscraper.com/api-docs#tag/Google-Maps/paths/~1maps~1reviews-v3/get
	const urlParams = {
		query: googlePlaceId,
		limit: 1,
		reviewsLimit: reviewLimit,
		async: true,
		ignoreEmpty: true,
		sort: "newest"
	};

	// only fetch reviews from after a specific date
	if(cutoff)
		urlParams.cutoff = cutoff;

	// append the amount of reviews we want to skip related to batch number
	if(page > 1)
		urlParams.skip = (page - 1) * reviewLimit;

	const url = apiBasepath + "?" + (new URLSearchParams(urlParams)).toString();

	const envConfig = {
		url: url,
		headers: { "X-API-KEY": outscraperApiKey },
		method: "GET"
		,
		... config.envConfig
	};

	console.log("url ===", url);

	const responseWithResultsId = await request.getAsync(envConfig);

	if(responseWithResultsId.statusCode == 401)
	{
		// 401 = Wrong or missing API Key (token).
		throw new Error("missing_outscraper_api-key");
	}

	if(responseWithResultsId.statusCode == 402)
	{
		// 402 = Past due invoices or missing card verification.
		throw new Error("outscraper_invoice_issue");
	}

	if(responseWithResultsId.statusCode == 422)
	{
		// 422 = Wrong query url parameters.
		throw new Error("outscraper_bad_query_parameters");
	}

	if(responseWithResultsId.statusCode == 204)
	{
		// 204 = The request was finished with failure and has no results. Ie, place doesn't exist anymore, so delete from database
		return branch.save("google_id", null);
	}

	if(responseWithResultsId.statusCode == 200)
	{
		// 200 async is set to false
		throw new Error("outscraper_async_is_false");
	}

	if(responseWithResultsId.statusCode != 202)
		throw new Error("outscraper_bad_status " + responseWithResultsId.statusCode);

	const body = responseWithResultsId.body;

	let respObj = null;

	respObj = JSON.parse(body);

	console.log("respObj", respObj);

	// throw error is the response doesn't contain the results url where we collect the data
	if(! respObj.results_location)
		throw new Error("outscraper_bad_request_id " + respObj);

	const resultsUrl = respObj.results_location;

	const options = { url: resultsUrl };

	const res = await superRequestGetAsync(options);

	const results = JSON.parse(res.body);

	console.log("results ===", results);

	// if the results are not success, ie, failed, throw error
	if(results.status != "Success")
		throw new Error("result_status_not_success");

	// if no data, throw error
	if(! results.data)
		throw new Error("outscraper_no_data");

	// If everything it successful but there is an empty array, it's because there are no more reviews to collect.
	// This isn't an error, so just return null.
	if(!results.data.length)
		return null;

	// since we are using a specific google place_id, we will only ever get one data result.
	return results.data[0];
};

const loadBranchDetails = async(branch) =>
{
	console.log("Starting to load branch details");

	if(! branch.get("google_id"))
		throw new Error("no_google_id_branch_details");

	// If the branch currently has no Google review, leave out last_google_check to see if we are missing any
	const branchGoogleReviews = await bookshelf.knex("reviews")
	.where("branch_id", branch.get("id"))
	.andWhere("source", config.googleReviewType);

	const branchHasGoogleReviews = branchGoogleReviews?.length > 0;

	console.log("branchHasGoogleReviews", branchHasGoogleReviews);

	// we only want to get reviews since we last checked for them
	// but if the last_google_check is before we swapped over to outscraper, we want to collect all of the reviews as we are going to remove old reviews later in this function.
	let lastGoogleCheck = null;

	if(branch.get("last_google_check") && moment(branch.get("last_google_check"), "YYYY-MM-DD HH:mm:ss").isAfter(config.outscraperSwitchoverDate) && branchHasGoogleReviews)
		lastGoogleCheck = moment(branch.get("last_google_check"), "YYYY-MM-DD HH:mm:ss").format("X");

	console.log("last_google_check in the db ===", branch.get("last_google_check"));
	console.log("lastGoogleCheck", lastGoogleCheck);

	// Get one review from outscraper to test this
	const respObj = await fetchReviewsFromOutscraper(branch, 1 /* reviewLimit */, 1 /* page number */, branchHasGoogleReviews ? lastGoogleCheck : null);

	console.log("respObj 8612 ====", respObj);

	// return if no reviews to collect
	if(!respObj)
		return;

	// legit check the place_id is correct. We should only do this when collecting one review on the first run. Or if we have already done this check, fixed the place_id, and running the function again.
	const checkPlaceIsLegit = googlePlaceIdCheck(respObj, branch);

	console.log("Place is legit!");

	if(checkPlaceIsLegit !== true)
	{
		// if the place_ID doesn't match the branch, remove bad google place_id and for now give up.
		await branch.save({"google_id": null}, {patch: true});

		console.log("Place is not legit! :(");

		throw new Error("google_id_no_match_outscraper_review");
	}

	// Do opening hours if we don't currently have any in the db
	if(respObj.working_hours && (! branch.get("opening_times")))
	{
		try
		{
			const workingHours = reformatOpeningHours(respObj.working_hours);

			branch.set("opening_times", JSON.stringify(workingHours));

			console.log("Setting opening hours", JSON.stringify(workingHours));
		}
		catch (error)
		{
			console.log("error setting new working hours", error);
		}
	}

	// do branch phone number if we don't have one
	if(respObj.phone && (! branch.get("phone")))
	{
		console.log("Setting phone number");

		branch.set("phone", respObj.phone);
	}

	// do branch website if we don't have one
	if(respObj.site && (! branch.get("website")))
	{
		console.log("Setting website");
		branch.set("website", respObj.site);
	}

	// save changes to branch
	// we do here rather than after the reviews fetched since there can be a race condition
	// if someone else edits the branch row in the meantime (we'd over-write their changes)
	await branch.save();

	// if no reviews then don't continue
	if(! respObj.reviews || ! respObj?.reviews_data.length)
	{
		console.log("No reviews for branch", branch.get("id"));
		return false;
	}

	let reviewResp = [];

	// load all review
	for(let pageNum = 1; pageNum <= Math.ceil(respObj.reviews/config.reviewsPerOutscraperBatch); pageNum++)
	{
		// If outscraper tells us there are reviews, but we have none in the db, we are setting the cutoff date to null so we can get all of them
		const respObj = await fetchReviewsFromOutscraper(branch, config.reviewsPerOutscraperBatch, pageNum, branchHasGoogleReviews ? lastGoogleCheck : null);

		// if valid reviews, add to review array
		if(respObj.reviews_data && (respObj.reviews_data.length > 0))
			reviewResp = reviewResp.concat(respObj.reviews_data);
		else
			break; // reached end of reviews
	}

	if(reviewResp.length === 0)
	{
		// we no reviews, even though Outscraper said we did
		// this usually means there have been no reviews left since the last time we checked.
		return false;
	}

	// if we have lots of reviews, and this is the first time we've run through Outscraper, then delete all the old reviews
	if(branchHasGoogleReviews &&
		(branch.get("last_google_check") === null) ||
		(branch.get("last_google_check") && moment(branch.get("last_google_check"), "YYYY-MM-DD HH:mm:ss").isBefore(config.outscraperSwitchoverDate)))
	{
		await bookshelf.knex("reviews")
		.where("branch_id", branch.get("id"))
		.andWhere("source", config.googleReviewType)
		.andWhere("hide", 0)
		.del();
	}

	await Promise.mapSeries(reviewResp, async(revObj) =>
	{
		// in the details we add the author id to check for dupes, and we also add the owners response if there is one.
		const reviewDetails = {
			author_id: revObj.author_id,
			review_id: revObj.review_id,
			review_likes: revObj.review_likes
		};

		if(revObj.owner_answer)
		{
			reviewDetails.owner_answer = revObj.owner_answer;
			reviewDetails.owner_answer_timestamp = revObj.owner_answer_timestamp;
		}

		const obj = {
			created_at: moment(revObj.review_timestamp, "X").utc().format("YYYY-MM-DD HH:mm:ss"),
			detail: JSON.stringify(reviewDetails),
			branch_id: branch.get("id"),
			source: config.googleReviewType,
			summary: revObj.review_text,
			rating: revObj.review_rating,
			author_name: revObj.author_title
		};

		// does review already exist? NOTE: Since the Google API and Outscraper has the same author ids, we can use this logic for both, but once we scrap the google api reviews, we can improve this.
		const rows = await bookshelf.knex("reviews")
		.where("branch_id", obj.branch_id)
		.where("source", config.googleReviewType)
		.where(qb =>
		{
			qb.where("detail", "LIKE", "%" + revObj.author_id + "%")
			.orWhere("created_at", obj.created_at);
		});

		// if we have rows, we have a duplicate review
		if(rows.length != 0)
		{
			// if we have a match, check the review summary and timestamp are different, if they are, then the google review has been updated and we should update the review
			if((rows[0].summary != revObj.review_text) && (rows[0].created_at != obj.created_at))
			{
				console.log("Updating review", rows[0].id, rows[0], obj);

				return bookshelf.knex("reviews")
				.where("id", rows[0].id)
				.update(obj);
			}
			else
			{
				// if the review is the same, return and don't save
				console.log("Duplicate review found, skipping", rows[0].id, rows[0], obj);

				return false;
			}
		}

		console.log("Adding a review!");

		return bookshelf.knex("reviews").insert(obj);

	});


};

googleImport.doBranch = async function(branchId)
{
	// load branch
	const branch = await new Branch({id: branchId}).fetch({require: true});

	console.log("STARTING IMPORT");

	const branchLastGoogleCheck = branch.get("last_google_check");

	// if the branches last_google_check date is in the future, we do not want to get their details
	if(branchLastGoogleCheck && moment(branchLastGoogleCheck, "YYYY-MM-DD HH:mm:ss").isAfter(moment().format("YYYY-MM-DD HH:mm:ss")))
		throw new Error("Branch last google check is in the future " + branchLastGoogleCheck);

	// check for google place id if we don't have one
	if(! branch.get("google_id"))
	{
		// check googles API for the place ID
		try
		{
			await findBranchIdFromGoogle(branch);
		}
		catch (error)
		{
			console.log("Error from Google API when trying to fetch place ID", error);
		}


		// if Google cannot get the place_id, try outscraper
		if(! branch.get("google_id"))
		{
			try
			{
				await findBranchIdFromOutscraper(branch);
			}
			catch (error)
			{
				console.log("Cannot get google place ID from Outscraper", error);
			}
		}

	}

	if(branch.get("google_id"))
	{
		await loadBranchDetails(branch);

		console.log("Branch updated with no errors!");
	}

	if(branch)
		return branch.save({last_google_check: moment().format("YYYY-MM-DD HH:mm:ss")});
};

module.exports = googleImport;