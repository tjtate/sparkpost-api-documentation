var matchdep = require('matchdep')
    , fs = require('fs')
    , request = require('request');

module.exports = function(grunt) {
    // Dynamically load any preexisting grunt tasks/modules
    matchdep.filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    // Configure existing grunt tasks and create custom ones
    grunt.initConfig({
        concat: {
            options: {
                banner: 'FORMAT: X-1A' + grunt.util.linefeed +
                'HOST: https://api.sparkpost.com/api/v1' +
                grunt.util.linefeed + grunt.util.linefeed
            },
            prod: {
                src: [
                    'services/introduction.md',
                    'services/metrics_api.md',
                    'services/recipient_list_api.md',
                    'services/sending_domains_api.md',
                    'services/substitutions_reference.md',
                    'services/suppression_list_api.md',
                    'services/templates_api.md',
                    'services/transmissions_api.md',
                    'services/webhooks_api.md',
                    'services/smtp_api.md'
                ],
                dest: 'apiary.apib'
            }
        },
        shell: {
            test: {
                command : function(file) {
                    if (file) {
                        file = './services/' + file
                    } else {
                        file = 'apiary.apib'
                    }
                    return 'node ./node_modules/.bin/api-blueprint-validator ' + file;
                },
                options : {
                    stdout : true,
                    stderr: false,
                    failOnError : true
                }
            }
        }
    });

    grunt.registerTask('generate-apiary-preview', 'Creates apiary.html preview', function() {
        var done = this.async()
            , options = {
                url: 'https://api.apiary.io/blueprint/generate',
                body: fs.readFileSync('./apiary.apib', 'utf-8'),
                headers: {
                    'Accept': 'text/html',
                    'Content-Type': 'text/plain'
                }
            };
        
        request.post(options, function(err, response, body) {
            if (err || response.statusCode !== 200) {
                grunt.log.error('There was an error trying to generate the preview for ' + file, err, response.statusCode, response.body);
                done(false);
            } else {
                fs.writeFile('./apiary.html', body, function(err) {
                    if (err) {
                        grunt.log.error('There was an error trying to write to apiary.html', err);
                        return done(false);
                    }
                    done();
                });
            }
        });
    });

    // grunt testFiles - runs apiary-blueprint-validator on individual blueprint files
    grunt.registerTask('testFiles', 'Validates individual blueprint files', [
        'shell:test:introduction.md',
        'shell:test:metrics_api.md',
        'shell:test:recipient_list_api.md',
        'shell:test:sending_domains_api.md',
        'shell:test:substitutions_reference.md',
        'shell:test:suppression_list_api.md',
        'shell:test:templates_api.md',
        'shell:test:transmissions_api.md',
        'shell:test:webhooks_api.md',
        'shell:test:smtp_api.md'
    ]);

    //grunt preview - creates a livereloaded preview of the docs, Apiary-style
    grunt.registerTask('preview', 'View the apiary generated HTML files in the browser', [
        'compile',
        'generate-apiary-preview'
    ]);

    // grunt test - runs apiary-blueprint-validator on combined apiary.apib file
    grunt.registerTask('test', [ 'shell:test' ]);

    // grunt compile - concatenates all the individual blueprint files and validates it
    grunt.registerTask('compile', [ 'concat:prod', 'test' ]);

    // register default grunt command as grunt test
    grunt.registerTask('default', [ 'testFiles' ]);
};
