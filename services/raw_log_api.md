# Group Raw Log

**Note** 

The Raw Log API is available for SparkPost Elite only.

In addition to the analytics data available through the UI, Metrics API, and Webhooks API, SparkPost Elite provides log files tracking the full disposition status of every message transiting the system.  The Raw Log API enables you to download these raw, compressed logs.

You can retrieve the following logs:
* Main log provides complete information about every message received and delivered by SparkPost Elite, including receptions, deliveries, transient failures, and permanent failures.
* Bounce log records in-band and out-of-band bounces.
* Rejection log stores records of inbound messages that are rejected by SparkPost Elite, either due to policy or protocol deviations.
* FBL log records the information provided by the ISP's feedback loop service with regard to spam notifications.
* Event log includes a batch of event data consisting of one or more event records, each composed of a payload wrapped in a type-specific JSON envelope. Each event record payload includes the data fields specific to that event type. For the field definitions and a mapping of the fields that constitute a payload for a given event type, use the Webhooks Events Documentation and Events Samples endpoints.

Logs include data for one day, and the log entries differ depending upon the event type. The logs, with the exception of the eventlog, are in @ delimited format. 

## Discoverability Dates [/rawlog]

The Raw Log API is designed for discoverability of available logs.  Calling the API root displays a list of dates with the corresponding URL for which logs are available.

### Log Discoverability Dates [GET]

Provides all dates with the corresponding URL for which logs are available.

+ Request

  + Headers

            Authorization: 14ac5499cfdd2bb2859e4476d2e5b1d2bad079bf
            Accept: application/json

+ Response 200 (application/json; charset=utf-8)

        {
            "results": [
                    { "date":"2014-05-14", "href":"http://host.tld/rawlog/2014/05/14" },
                    { "date":"2014-05-15", "href":"http://host.tld/rawlog/2014/05/15" },
                    { "date":"2014-05-16", "href":"http://host.tld/rawlog/2014/05/16" }
            ]
        }

## Logs by Date [/rawlog/{year}/{month}/{day}]

### Logs for a Given Date [GET]

List the URLs, one for each node that has available logs for a given date. The list is sorted by node name.

+ Parameters
  + year (required, date, `2014 (Numeric year)`) ... Year for which the log is available
  + month (required, date, `07 (1-12, Numeric month)`) ... Month for which the log is available
  + day (required, date, `23 (1-31, Numeric day)`) ... Day for which the log is available

+ Request

  + Headers

            Authorization: 14ac5499cfdd2bb2859e4476d2e5b1d2bad079bf
            Accept: application/json

+ Response 200 (application/json; charset=utf-8)
    
        {
            "results": [
                { "node":"node_1", "href":"http://host.tld/rawlog/2014/05/14/node_1" },
                { "node":"node_2", "href":"http://host.tld/rawlog/2014/05/15/node_2" },
                { "node":"node_3", "href":"http://host.tld/rawlog/2014/05/16/node_3" }
            ]
        }

+ Response 404 ()
    
        A 404 Not Found is returned if no logs are found for any nodes for the given day.


## Logs by Nodes [/rawlog/{year}/{month}/{day}/{node}]

### Logs for a Given Node [GET]

List the available logs for a given node on a given date. The response includes log type, size, and URL.

+ Parameters
  + year (required, date, `2014 (Numeric year)`) ... Year for which the log is available
  + month (required, date, `07 (1-12, Numeric month)`) ... Month for which the log is available
  + day (required, date, `23 (1-31, Numeric day)`) ... Day for which the log is available
  + node (required, string, `node_1`) ... Name of node from which the logs are to be discovered

+ Request

  + Headers

            Authorization: 14ac5499cfdd2bb2859e4476d2e5b1d2bad079bf
            Accept: application/json

+ Response 200 (application/json; charset=utf-8)
    
            {
                "results": [
                    { "log":"bounce", "size":"400218", "href":"http://host.tld/rawlog/2014/05/14/node_2/bounce" },
                    { "log":"main", "size":"610485", "href":"http://host.tld/rawlog/2014/05/15/node_2/main" },
                    { "log":"reject", "size":"526482", "href":"http://host.tld/rawlog/2014/05/16/node_2/reject" },
                    { "log":"fbl", "size":"192635", "href":"http://host.tld/rawlog/2014/05/16/node_2/fbl" },
                    { "log":"event", "size":"351932", "href":"http://host.tld/rawlog/2014/05/16/node_2/event" }
                ]
            }

+ Response 404 ()
    
        A 404 Not Found is returned if no logs are found for the given date and node.



## Retrieve [/rawlog/{year}/{month}/{day}/{node}/{log}]

### Retrieve a Log [GET]

Retrieve a specific log for a given date and node. The API returns the data for the log as a bzip2 compressed file.  If the resource is not available, the API returns 404 'Not Found'.


+ Parameters
  + year (required, date, `2014 (Numeric year)`) ... Year for which the log is available
  + month (required, date, `07 (1-12, Numeric month)`) ... Month for which the log is available
  + day (required, date, ` 23 (1-31, Numeric day)`) ... Day for which the log is available
  + node (required, string, `node_1`) ... Name of node from which to download the log
  + log (required, string, `main`) ... Available logs are main, bounce, reject, fbl, or event


+ Request

  + Headers
      
            Authorization: 14ac5499cfdd2bb2859e4476d2e5b1d2bad079bf
            Accept: application/json

+ Response 200 ('Content-Disposition': 'attachment; filename=log_name', 'Content-Type': 'application/octet-stream')
    
        {
            "results": {}
        }

+ Response 404 ()
    
        A 404 Not Found is returned if the requested Log file is not found on the specified node.
