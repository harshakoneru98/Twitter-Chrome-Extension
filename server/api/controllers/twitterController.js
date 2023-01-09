const e = require('express');
const { PythonShell } = require('python-shell');
const config = require('../../config');

exports.language_detection = async (req, res, next) => {
    try {
        let tweets_input = req.body;
        let options = {
            pythonPath: config.PYTHON_PATH,
            scriptPath: 'api/scripts',
            args: [JSON.stringify(tweets_input.map((obj) => obj.tweet_text))]
        };

        const result = await new Promise(async (resolve, reject) => {
            await PythonShell.run(
                'detect_language.py',
                options,
                async function (err, results) {
                    if (err) return reject(err);
                    return resolve(results);
                }
            );
        });

        if (result == null) {
            res.json([]);
        } else {
            let language_results = JSON.parse(result[0]);
            const output = [];

            tweets_input.map((tweet, id) => {
                output.push({
                    tweet_text: tweet.tweet_text,
                    is_english: language_results[id] == 1 ? true : false
                });
            });

            res.json(output);
        }
    } catch (err) {
        res.status(404).json({
            error: err
        });
    }
};

exports.sentiment_score = async (req, res, next) => {
    try {
        let english_tweets = req.body;

        let options = {
            pythonPath: config.PYTHON_PATH,
            scriptPath: 'api/scripts',
            args: [JSON.stringify(english_tweets)]
        };

        const result = await new Promise(async (resolve, reject) => {
            await PythonShell.run(
                'calculate_sentiment.py',
                options,
                async function (err, results) {
                    if (err) return reject(err);
                    return resolve(results);
                }
            );
        });

        let final_result = [];

        result.map((res) => {
            final_result.push(JSON.parse(res));
        });

        res.json(final_result);
    } catch (err) {
        res.status(404).json({
            error: err
        });
    }
};
