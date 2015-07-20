# Group Webhooks

The Webhooks API provides the means to create, review, update, and delete webhooks, which enables you to
receive push updates of the raw events generated by SparkPost and SparkPost Elite.

The following are key operational details: 
* Any webhook batch that does not receive an HTTP 200 response will be retried for a total of 4 hours before the data is discarded.
* Each webhook batch contains the header X-MessageSystems-Batch-ID, which is useful for auditing and prevention of processing duplicate batches.
* Webhooks posting to your endpoint will timeout after 10 seconds. For best results, write webhook batches to disk and then process asynchronously to minimize data loss if you have a problem with your database.

## Webhooks Object Properties

| Property          | Type   | Description | Required | Notes |
|-------------------|--------|-------------|----------|-------|
| name              | string | User-friendly name for webhook | yes | example: `Example webhook` |
| target            | string | URL of the target to which to POST event batches | yes |  When a webhook is created or updated with a change to this property, a test POST request is sent to the given URL. The target URL must accept the connection and respond with HTTP 200; otherwise, your request to the Webhook API will fail with HTTP 400, and the requested change will not be applied.<br />example: `http://client.example.com/example-webhook` |
| events            | array  | Array of event types this webhook will receive | yes | Use the Webhooks Events endpoint to list the available event types.<br />example: `["delivery", "injection", "open", "click"]`|
| auth_type         | string | Type of authentication to be used during POST requests to target | no | examples: `oauth2`, `none` |
| auth_request_details | JSON | Object containing details needed to request authorization credentials, as necessary | no | example: `{ "url": "https://oauth.myurl.com/tokens", "body": { "client_id": "<oauth client id>", "client_secret": "<oauth client secret>" }}`|
| auth_credentials         | JSON | Object containing credentials needed to make authorized POST requests to target | no | example: `{ access_token: "<oauth token>", expires_in: 3600 }` |
| auth_token        | string | Authentication token to present in the X-MessageSystems-Webhook-Token header of POST requests to target | no | Use this token in your target application to confirm that data is coming from the Webhooks API. <br />example: `5ebe2294ecd0e0f08eab7690d2a6ee69`<br /><br />_Note: This field is deprecated, you should use the auth_type field instead._ |

__**Sparkpost Webhooks use MaxMinds software [MaxMinds License](/docs/3RD_PARTY_LICENSES.md)**__
 
## Events Documentation [/webhooks/events/documentation]

### Documentation [GET]

List descriptions of the events, event types, and event fields that could be included in a Webhooks post to your target URL.

+ Request

  + Headers
      Accept: application/json

+ Response 200 (application/json)
  ```js
  {
    "results": {
      "message_event": {
        "description": "Message events describe the life cycle of a message including injection, delivery, and disposition.",
        "display_name": "Message Events",
        "events": {
          "bounce": {
            "description": "Remote MTA has permanently rejected a message.",
            "display_name": "Bounce",
            "event": {
              "campaign_id": {
                "description": "Campaign of which this message was a part",
                "sampleValue": "Example Campaign Name"
              },
              "timestamp": {
                "description": "Event date and time, in Unix timestamp format (integer seconds since 00:00:00 GMT 1970-01-01)",
                "sampleValue": 1427736822
              }
            }
          }
        }
      }
    }
  }
  ```

## Events Samples [/webhooks/events/samples{?events}]
  
### Samples [GET]

List an example of the event data that will be posted by a Webhook for the specified events.

+ Parameters
  + events (optional, string, `bounce`) ... Event types for which to get a sample payload, use the Webhooks Events endpoint to list the available event types, defaults to all event types.

+ Request

  + Headers
      Accept: application/json

+ Response 200 (application/json)
  ```js
  {
    "results": [
      {
        "msys": {
          "message_event": {
            "type": "bounce",
            "bounce_class": "1",
            "campaign_id": "Example Campaign Name",
            "customer_id": "1",
            "error_code": "554",
            "ip_address": "127.0.0.1",
            "message_id": "0e0d94b7-9085-4e3c-ab30-e3f2cd9c273e",
            "msg_from": "sender@example.com",
            "msg_size": "1337",
            "num_retries": "2",
            "rcpt_meta": {},
            "rcpt_tags": [
              "male",
              "US"
            ],
            "rcpt_to": "recipient@example.com",
            "reason": "000 Example Remote MTA Bounce Message",
            "routing_domain": "example.com",
            "template_id": "templ-1234",
            "template_version": "1",
            "timestamp": 1427736822,
            "transmission_id": "65832150921904138"
          }
        }
      }
    ]
  }
  ```

## Create [/webhooks]

### Create a Webhook [POST]

Create a webhook by providing a **webhooks object** as the POST request body.  On creation, events will
begin to be pushed to the target URL specified in the POST request body.

As described in "Webhooks Object Properties", webhook creation entails a test POST request to the URL given as the _target_ value. If this request does not receive an HTTP 200 response, your request to the Webhook API will fail with HTTP 400, and the webhook will not be created. If created successfully, the webhook will begin to receive event data after 1 minute.

+ Request (application/json)

  + Headers
      Authorization: 14ac5499cfdd2bb2859e4476d2e5b1d2bad079bf

  + Body

    ```js
    {
      "name": "Example webhook",
      "target": "http://client.example.com/example-webhook",
      "auth_type": "oauth2",
      "auth_request_details": {
        "url": "http://client.example.com/tokens",
        "body": {
            "client_id": "CLIENT123",
            "client_secret": "9sdfj791d2bsbf",
            "grant_type": "client_credentials"
        }
      },
      "auth_token": "",
      "events": [
        "delivery",
        "injection",
        "open",
        "click"
      ]
    }
    ```

+ Response 200 (application/json)

    ```js
    {
      "results": {
        "id": "12affc24-f183-11e3-9234-3c15c2c818c2",
        "links": [
          {
            "href": "http://www.messagesystems-api-url.com/api/v1/webhooks/12affc24-f183-11e3-9234-3c15c2c818c2",
            "rel": "urn.msys.webhooks.webhook",
            "method": ["GET","PUT"]
          }
        ]
      }
    }
    ```

+ Response 400 (application/json)

    ```js
    {
      "errors": {
        "code": 400,
        "message": "POST to webhook tokens URL failed"
      }
    }
    ```

## Retrieve [/webhooks/{id}{?timezone}]

+ Model

    + Body

        ```js
          {
            "results": {
              "name": "Example webhook",
              "target": "http://client.example.com/example-webhook",
              "events": [
                "delivery",
                "injection",
                "open",
                "click"
              ],
              "auth_type": "oauth2",
              "auth_request_details": {
                "url": "https://oauth.myurl.com/tokens",
                "body": {
                  "client_id": "<oauth client id>",
                  "client_secret": "<oauth client secret>"
                }
              },
              "auth_credentials": {
                "access_token": "<oauth token>",
                "expires_in": 3600
              },
              "auth_token": "",
              "links": [
                {
                  "href": "http://www.messagesystems-api-url.com/api/v1/webhooks/12affc24-f183-11e3-9234-3c15c2c818c2/validate",
                  "rel": "urn.msys.webhooks.validate",
                  "method": ["POST"]
                },
                {
                  "href": "http://www.messagesystems-api-url.com/api/v1/webhooks/12affc24-f183-11e3-9234-3c15c2c818c2/batch-status",
                  "rel": "urn.msys.webhooks.batches",
                  "method": ["GET"]
                }
              ]
            }
          }
        ```

### Retrieve Webhook Details [GET]

Retrieve details about a webhook by specifying its id in the URI path.

+ Parameters
  + id (required, uuid, `12affc24-f183-11e3-9234-3c15c2c818c2`) ... UUID identifying a webhook
  + timezone =`UTC` (optional, string, `America/New_York`) ... Standard timezone identification string, defaults to `UTC`

+ Request

  + Headers
      Authorization: 14ac5499cfdd2bb2859e4476d2e5b1d2bad079bf
      Accept: application/json

+ Response 200 (application/json)

    [Retrieve][]

## List [/webhooks{?timezone}]

+ Model

    + Body

        ```js
        {
          "results": [
            {
              "id": "12affc24-f183-11e3-9234-3c15c2c818c2",
              "name": "Example webhook",
              "target": "http://client.example.com/example-webhook",
              "events": [
                "delivery",
                "injection",
                "open",
                "click"
              ],
              "auth_type": "oauth2",
              "auth_request_details": {
                "url": "https://oauth.myurl.com/tokens",
                "body": {
                  "client_id": "<oauth client id>",
                  "client_secret": "<oauth client secret>"
                }
              },
              "auth_credentials": {
                "access_token": "<oauth token>",
                "expires_in": 3600
              },
              "auth_token": "",
              "last_successful": "2014-07-01 16:09:15",
              "last_failure": "2014-08-01 15:15:45",
              "links": [
                {
                  "href": "http://www.messagesystems-api-url.com/api/v1/webhooks/a2b83490-10df-11e4-b670-c1ffa86371ff",
                  "rel": "urn.msys.webhooks.webhook",
                  "method": ["GET","PUT"]
                }
              ]
            },
            {
              "id": "123456-abcd-efgh-7890-123445566778",
              "name": "Another webhook",
              "target": "http://client.example.com/another-example",
              "events": [
                "generation_rejection",
                "generation_failure"
              ],
              "auth_type": "none",
              "auth_request_details": {},
              "auth_credentials": {},
              "auth_token": "5ebe2294ecd0e0f08eab7690d2a6ee69",
              "links": [
                {
                  "href": "http://www.messagesystems-api-url.com/api/v1/webhooks/123456-abcd-efgh-7890-123445566778",
                  "rel": "urn.msys.webhooks.webhook",
                  "method": ["GET","PUT"]
                }
              ]
            }
          ]
        }
        ```

### List all Webhooks [GET]

List currently extant webhooks.

+ Parameters
  + timezone =`UTC` (optional, string, `America/New_York`) ... Standard timezone identification string, defaults to `UTC`

+ Request

  + Headers
      Authorization: 14ac5499cfdd2bb2859e4476d2e5b1d2bad079bf
      Accept: application/json

+ Response 200 (application/json)

  [List][]


## Update and Delete [/webhooks/{id}]

### Update a Webhook [PUT]

Update a webhook's properties by specifying its id in the URI path and use a **webhooks object** as
the PUT request body.

Note that batches currently queued for delivery to this webhook will not be affected by these
modifications.  For example, if you change the webhook's target URL, batches already queued for delivery will still be POSTed to the previous URL.

As described in "Webhooks Object Properties", a change to the _target_ value entails a test POST request to the URL given. If this request does not receive an HTTP 200 response, your request to the Webhooks API will fail with HTTP 400, and the webhook will not be modified.

+ Parameters
  + id (required, uuid, `12affc24-f183-11e3-9234-3c15c2c818c2`) ... UUID identifying a webhook

+ Request (application/json)

  + Headers
      Authorization: 14ac5499cfdd2bb2859e4476d2e5b1d2bad079bf

  + Body

    ```js
    {
      "name": "Renamed webhook",
      "events": [
        "rejection",
        "delay"
      ],
      "auth_type": "none"
    }
    ```

+ Response 200 (application/json)

    ```js
    {
      "results": {
        "id": "12affc24-f183-11e3-9234-3c15c2c818c2",
        "links": [
          {
            "href": "http://www.messagesystems-api-url.com/api/v1/webhooks/12affc24-f183-11e3-9234-3c15c2c818c2/validate",
            "rel": "urn.msys.webhooks.validate",
            "method": ["POST"]
          }
        ]
      }
    }
    ```

### Delete a Webhook [DELETE]

Delete a webhook from the system by specifying its id in the URI path.  The system will stop pushing data to the target URL after the batches currently queued to be
delivered are drained.

+ Parameters
  + id (required, uuid, `12affc24-f183-11e3-9234-3c15c2c818c2`) ... UUID identifying a webhook

+ Request

  + Headers
      Authorization: 14ac5499cfdd2bb2859e4476d2e5b1d2bad079bf

+ Response 204

## Validate [/webhooks/{id}/validate]

### Validate a Webhook [POST]

The validation sends an example message event batch from the Webhooks API to the
target URL, validates that the target responds with HTTP 200,
and returns detailed information on the response received from the target.

#### Message Properties

| Property   | Type   | Description | Required | Notes |
|------------|--------|-------------|----------|-------|
| message    | object | Example batch to send | yes | example: `{"msys": {}}`  |

+ Parameters
  + id (required, uuid, `12affc24-f183-11e3-9234-3c15c2c818c2`) ... UUID identifying a webhook

+ Request (application/json)

  + Headers
      Authorization: 14ac5499cfdd2bb2859e4476d2e5b1d2bad079bf

  + Body

    ```js
    {
        "message": {
            "msys": {}
        }
    }
    ```

+ Response 200 (application/json)

    ```js
    {
      "results": {
        "msg": "Test POST to endpoint succeeded",
        "response": {
          "status": 200,
          "headers": {
            "Content-Type": "text/plain"
          },
          "body": "OK"
        }
      }
    }
    ```

## Batch Status [/webhooks/{id}/batch-status{?limit}]

### Retrieve Status Information [GET]

Retrieve status information regarding batches that have been generated
for the given webhook by specifying its id in the URI path. Status information includes the successes of batches
that previously failed to reach the webhook's target URL and batches that
are currently in a failed state.

+ Parameters
  + id (required, uuid, `12affc24-f183-11e3-9234-3c15c2c818c2`) ... UUID identifying a webhook
  + limit (optional, int, `1000`) ... Maximum number of results to return. Defaults to `1000`.

+ Request

  + Headers
      Authorization: 14ac5499cfdd2bb2859e4476d2e5b1d2bad079bf
      Accept: application/json

+ Response 200 (application/json)

    ```js
    {
      "results": [
        {
          "batch_id": "032d330540298f54f0e8bcc1373f3cfd",
          "ts": "2014-07-30T21:38:08.000Z",
          "attempts": 7,
          "response_code": 200
        },
        {
          "batch_id": "13c6764994a8f6b4e29906d5712ca7d",
          "ts": "2014-07-30T20:38:08.000Z",
          "attempts": 2,
          "response_code": 400
        }
      ]
    }
    ```