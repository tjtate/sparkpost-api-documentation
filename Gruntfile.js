var matchdep = require('matchdep')
    , fs = require('fs')
    , q = require('q')
    , request = require('request')
    , services = [
        'introduction.md',
        'substitutions_reference.md',
        'inbound_domains_api.md',
        'metrics_api.md',
        'message_events_api.md',
        'raw_log_api.md',
        'recipient_list_api.md',
        'relay_webhooks_api.md',
        'sending_domains_api.md',
        'subaccounts_api.md',
        'suppression_list_api.md',
        'templates_api.md',
        'tracking_domains_api.md',
        'transmissions_api.md',
        'webhooks_api.md',
        'smtp_api.md'
    ];

module.exports = function(grunt) {
    // Dynamically load any preexisting grunt tasks/modules
    matchdep.filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    grunt.loadNpmTasks('grunt-aglio');
    grunt.loadNpmTasks('grunt-dom-munger');
    var navCache = {};

    // Configure existing grunt tasks and create custom ones
    grunt.initConfig({
        aglio: {
            build: {
                files:
                    services.reduce(function(obj, val, idx) {
                      var name = (val.split('.'))[0];
                      obj['aglio/'+ name +'.html'] = [ 'services/'+ val ];
                      return obj;
                    }, {})
            },
        },
        dom_munger: {
            getnav: {
                options: {
                    callback: function($,file) {
                        // absolutify the links
                        $('nav a[href^=#]').each(
                          function(idx, elt) {
                            var jelt = $(elt);
                            var html = (file.split('/'))[1];
                            var href = html + jelt.attr('href');
                            grunt.log.writeln('rewriting to ['+ href +']');
                            jelt.attr('href', href);
                          }
                        )

                        var name = (file.split('.'))[0];
                        if (!navCache[name]) {
                            navCache[name] = $('nav').html();
                            grunt.log.writeln('cached '+ navCache[name].length +' characters for '+ name)
                        }

                        return false;
                    }
                },
                src: services.map(function(s) { var name = (s.split('.'))[0]; return 'aglio/'+ name +'.html'; })
            },
            setnav: {
                options: {
                    callback: function($,file) {
                          var names = services.map(function(s) { return (s.split('.'))[0]; });
                          for (var idx in names) {
                            var name = names[idx]
                            var nav = $.load(navCache[name])
                            grunt.log.writeln('found '+ navCache[name].length +' characters for '+ name)
                            grunt.log.writeln(file +'('+ name +') '+ ': '+ $('div.heading a', nav).text());
                          }
                          // TODO: add full nav to each page, marking current page with a style
                          return false;
                    }
                },
                src: services.map(function(s) { var name = (s.split('.'))[0]; return 'aglio/'+ name +'.html'; })
            }
        },
        concat: {
            options: {
                banner: 'FORMAT: X-1A' + grunt.util.linefeed +
                    'HOST: https://api.sparkpost.com/api/v1' +
                    grunt.util.linefeed + grunt.util.linefeed
            },
            prod: {
                src: services.map(function(s) { return 'services/' + s; }),
                dest: 'apiary.apib'
            }
        },
        connect: {
            apiary: {
                options: {
                    port: 4000,
                    hostname: '0.0.0.0',
                    open: true,
                    middleware: function(connect) {
                        return [
                            require('connect-livereload')(),
                            connect.static('apiary-previews'),
                            connect.directory('apiary-previews')
                        ];
                    }
                }
            }
        },
        shell: {
            test: {
                command : function(file) {
                    if (file) {
                        file = './services/' + file;
                    } else {
                        file = 'apiary.apib';
                    }
                    return 'node ./bin/api-blueprint-validator ' + file;
                },
                options : {
                    stdout : true,
                    stderr: false,
                    failOnError : true
                }
            }
        },
        watch: {
            apiaryDocs: {
                files: [ 'services/*.md', 'Gruntfile.js' ],
                tasks: [ 'generate-apiary-preview' ],
                options: {
                    livereload: true
                }
            }
        }
    });

    /**
     * Generates an apiary preview for an .md file
     * @param file The .md file
     * @returns {*|promise}
     */
    function generatePreview(file) {
        var deferred = q.defer();

        var blueprint = 'FORMAT: X-1A' +
            grunt.util.linefeed +
            'HOST: https://api.sparkpost.com/api/v1' +
            grunt.util.linefeed + grunt.util.linefeed +
            '# SparkPost API v1' +
            grunt.util.linefeed +
            fs.readFileSync('./services/' + file, 'utf-8');
        var embedOptions = { apiBlueprint: blueprint };

        var body = '\
<!DOCTYPE html>\n\
<html lang="en">\n\
<head>\n\
  <meta charset="UTF-8">\n\
  <title>' + file + '</title>\n\
</head>\n\
<body>\n\
  <script src="https://api.apiary.io/seeds/embed.js"></script>\n\
  <script>\n\
    var embed = new Apiary.Embed(' + JSON.stringify(embedOptions) + ');\n\
  </script>\n\
</body>\n\
</html>\
';

        var output = file.split('\.')[0] + '.html';

        fs.writeFile('./apiary-previews/' + output, body, function(err) {
            if (err) {
                grunt.log.error('There was an error trying to write to ' + output, err);
                return deferred.reject(err);
            }
            return deferred.resolve();
        });

        return deferred.promise;
    }

    // grunt generate-apiary-preview - creates apiary previews for all meta
    grunt.registerTask('generate-apiary-preview', 'Creates preview files for all md files in services', function() {
        var done = this.async();
        try {
            fs.mkdirSync('./apiary-previews');
        } catch(e){}

        fs.readdir('./services', function(err, files) {
            q.all(files.map(generatePreview)).then(done, done);
        });
    });

    // grunt testFiles - runs apiary-blueprint-validator on individual blueprint files
    grunt.registerTask('testFiles', 'Validates individual blueprint files', services.map(function(s) {
        return 'shell:test:' + s;
    }));

    //grunt preview - creates a live-reloaded preview of the docs, Apiary-style
    grunt.registerTask('preview', 'View the apiary generated HTML files in the browser with all that live-reload goodness', [
        'generate-apiary-preview',
        'connect:apiary',
        'watch:apiaryDocs'
    ]);

    // grunt test - runs apiary-blueprint-validator on combined apiary.apib file
    grunt.registerTask('test', [ 'shell:test' ]);

    // grunt compile - concatenates all the individual blueprint files and validates it
    grunt.registerTask('compile', [ 'concat:prod', 'test' ]);

    // register default grunt command as grunt test
    grunt.registerTask('default', [ 'testFiles' ]);
};
