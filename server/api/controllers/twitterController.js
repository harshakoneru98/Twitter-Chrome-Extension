const e = require('express');
const { PythonShell } = require('python-shell');
const config = require('../../config');

exports.language_detection = async (req, res, next) => {
    try {
        let tweets_input = req.body;
	// console.log('Input: ', tweets_input)
        let options = {
            pythonPath: config.PYTHON_PATH,
            scriptPath: 'api/scripts',
            args: [JSON.stringify(tweets_input.map((obj) => obj.tweet_text))]
        };

        const result = await new Promise((resolve, reject) => {
            PythonShell.run(
                'detect_language.py',
                options,
                async function (err, results) {
                    if (err) return reject(err);
                    return resolve(results);
                }
            );
        });

	if(result == null){
		console.log('Failed LD : ', JSON.stringify(tweets_input.map((obj) => obj.tweet_text)))
	}else{
		console.log('Passed LD : ', JSON.stringify(tweets_input.map((obj) => obj.tweet_text)))
	}
	
	console.log('Python Output : ', result)
        let language_results = JSON.parse(result[0]);
	// console.log('JSON parse : ', language_results)
        const output = [];

        tweets_input.map((tweet, id) => {
            output.push({
                tweet_text: tweet.tweet_text,
                is_english: language_results[id] == 1 ? true : false
            });
        });

        res.json(output);
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

        const result = await new Promise((resolve, reject) => {
            PythonShell.run(
                'calculate_sentiment.py',
                options,
                async function (err, results) {
                    if (err) return reject(err);
                    return resolve(results);
                }
            );
        });
	
	console.log('Result : ', result)
	if(result == null){
                console.log('Failed SS : ', JSON.stringify(english_tweets))
        }else{
		console.log('Passed SS : ', JSON.stringify(english_tweets))
	}

        let final_result = [];

        result.map((res) => {
            final_result.push(JSON.parse(res));
        });

	console.log('Final Result : ', final_result)

        res.json(final_result);
    } catch (err) {
        res.status(404).json({
            error: err
        });
    }
};
