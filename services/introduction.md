# SparkPost API v1
There are two service types available:  [SparkPost](http://sparkpost.com/), our self-service product, and [SparkPost Elite](https://www.sparkpost.com/products/sparkpost-elite), a managed service with guaranteed burst rates and white-glove support. These services have shared and unique aspects, with those unique aspects indicated in our consolidated API documentation as follows:
* Features specific to **SparkPost** are indicated as "SparkPost only".
* Features specific to **SparkPost Elite** products are indicated by "SparkPost Elite only".

## API Endpoints
* JSON is the basis for its request input and response format.
* SparkPost and SparkPost Elite listen on port 443, so no explicit port number is required.

### SparkPost API Endpoint
**https\://api.sparkpost.com/api/v1**

Note: To prevent abuse, our servers enforce request rate limiting, which may trigger responses with HTTP code 429.

### SparkPost Elite API Endpoint
**https\://yourdomain.msyscloud.com/api/v1**


## API Conventions
* API versioning is handled using a major version number in the URL, e.g. /api/v1/endpoint.
* /something is equivalent to /something/.
* URL paths, URL query parameter names, JSON field names, and XML element names are case sensitive.
* URL paths use lower case, with dashes separating words.
* Query parameters and JSON fields use lower case, with underscores separating words.
* The HTTP status indicates whether an operation failed or succeeded, with extra information included in the HTTP response body.
* All APIs return standard error code formats.
* Unexpected query parameters are ignored.
* Unexpected JSON fields or XML elements in the request body are ignored.
* The JSON number type is bounded to a signed 32-bit integer.

## Authentication
* All API's require that you authenticate with every request.
* To authenticate with the various API's, specify the "Authorization" header with each request. The value of the "Authorization" header must be a valid API key or conform to the standard for Basic authentication.
* Administrators can generate an API key using the UI. Please take care to record and safeguard your API keys at all times. You cannot retrieve an API key after it has been created.
* For examples of supplying the Authorization header, refer to the cURL example below or any of the individual API request examples.

## Using Postman

If you use [Postman](https://www.getpostman.com/) you can click the following button to import the SparkPost API as a collection:

[![Run in Postman](https://s3.amazonaws.com/postman-static/run-button.png)](https://www.getpostman.com/run-collection/81ee1dd2790d7952b76a)

## Using cURL
If you are using cURL to call the API, you must include the resource URI in quotes when you pass in multiple query parameters separated by an **&**.

For example:

```
curl -v \
-H "Content-Type: application/json" \
-H "Authorization: 14ac5499cfdd2bb2859e4476d2e5b1d2bad079bf" \
-X GET "https://api.sparkpost.com/api/v1/metrics/deliverability/aggregate?campaigns=testjob&from=2014-01-23T14:00&metrics=count_targeted,count_sent,count_accepted&protocols=smtp&timezone=America%2FNew_York&to=2014-06-23T15:50"
```

or

```
curl -v \
-H "Content-Type: application/json" \
-u <APIKey>: \
-X GET "https://api.sparkpost.com/api/v1/metrics/deliverability/aggregate?campaigns=testjob&from=2014-01-23T14:00&metrics=count_targeted,count_sent,count_accepted&protocols=smtp&timezone=America%2FNew_York&to=2014-06-23T15:50"
```

## Subaccounts
<a name="subaccounts-intro"></a>
With the introduction of subaccounts, some of the APIs are now able to store and retrieve information at a more granular level.
Subaccounts are a way for service providers to provision and manage their customers separately from each other and to provide assets and reporting data.

The following APIs have subaccount support:

* [Metrics API](https://developers.sparkpost.com/api/#/reference/metrics) **(Note: Not available for Subaccount API keys)**
* [Message Events API](https://developers.sparkpost.com/api/#/reference/message-events)
* [Sending Domains API](https://developers.sparkpost.com/api/#/reference/sending-domains)
* [Suppression List API](https://developers.sparkpost.com/api/#/reference/suppression-list)
* [SMTP API](https://developers.sparkpost.com/api/#/reference/smtp-api)
* [Transmissions API](https://developers.sparkpost.com/api/#/reference/transmissions)

**Note**: support coming soon for the following
* [Tracking Domains API](#tracking-domains-api)

### Terminology
* Master Account - This refers to a Service Provider and their data
* Subaccounts - This refers to a Service Provider's customer(s), and that customer's data

### Managing subaccount data as a Service Provider
* Master Accounts can set `X-MSYS-SUBACCOUNT` with the ID of their subaccount to manage subaccount data on their behalf
  * For example, on a GET request to `/api/v1/sending-domains`, setting `X-MSYS-SUBACCOUNT` to `123` will only return sending domains which belong to Subaccount `123`
  * The same applies to data management, setting `X-MSYS-SUBACCOUNT` to `123` on a POST request to `/api/v1/sending-domains` will create a sending domain belonging to Subaccount `123`
* `X-MSYS-SUBACCOUNT` is not required, but if provided, must be a number

### Managing master account data as a Service Provider
* Setting `X-MSYS-SUBACCOUNT` to `0` will retrieve or manage Master Account data only
* For POST/PUT/DELETE requests, omitting `X-MSYS-SUBACCOUNT` will result in the same behavior as setting `X-MSYS-SUBACCOUNT` to `0`
* For GET requests, omitting `X-MSYS-SUBACCOUNT` will result in Master Account and Subaccount data in the response
  * Subaccount data will have the key `subaccount_id` in the response object
* Metrics and Message Events APIs do not use `X-MSYS-SUBACCOUNT`. Instead, setting the query parameter `subaccounts` to `0` will return only Master Account reporting data

## SMTP Relay Endpoints
<a name="smtp-relay-endpoints"></a>

### SparkPost SMTP Endpoint
To use SparkPost as an SMTP relay you need to point your SMTP client (or local MTA) to the following endpoint:

* Host: smtp.sparkpostmail.com
* Port: 587 or 2525
* Encryption: STARTTLS
* Authentication: AUTH LOGIN
* User: SMTP_Injection
* Password: Any API key with Send via SMTP permission
* To send mail over an SMTP relay endpoint on behalf of a Subaccount, modify the your `User` to include the subaccount ID.
  * For example, use `SMTP_Injection:X-MSYS-SUBACCOUNT=123` to send as a Subaccount, having an ID of 123.
  * The Master Account's API key is still used as the password when sending on behalf of a Subaccount.
  * When sending on behalf of a Subaccount, the Subaccount's Sending Domain must be used.

**Note**: Port 2525 is provided as an alternate port for cases where port 587 is blocked (such as a Google Compute Engine environment).

### SparkPost Elite SMTP Endpoint

* Please contact your Technical Account Manager for details on your SMTP endpoint.

The SMTP relay optionally supports advanced API features using the [SMTP API](#smtp-api).  To create an API key, login to your SparkPost [Account Credentials](https://app.sparkpost.com/account/credentials) page.
