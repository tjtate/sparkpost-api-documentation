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

**Note**: Port 2525 is provided as an alternate port for cases where port 587 is blocked (such as a Google Compute Engine environment).

### SparkPost Elite SMTP Endpoint

* Please contact your Technical Account Manager for details on your SMTP endpoint.  

The SMTP relay optionally supports advanced API features using the [SMTP API](#smtp-api).  To create an API key, login to your SparkPost [Account Credentials](https://app.sparkpost.com/account/credentials) page.
