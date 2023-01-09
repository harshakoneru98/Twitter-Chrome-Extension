// Check if element exists or not
let waitForElm = (selector) => {
    return new Promise((resolve) => {
        if (document.querySelector(selector)) {
            return resolve(document.querySelector(selector));
        }

        const observer = new MutationObserver((mutations) => {
            if (document.querySelector(selector)) {
                resolve(document.querySelector(selector));
                observer.disconnect();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
};

let language_detection_endpoint = async (tweets) => {
    let body = tweets.map((tweet) => ({
        tweet_text: tweet
    }));

    await fetch('https://tradework.online/api/language-detection', {
        method: 'POST',
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    })
        .then((data) => data.json())
        .then((data) => {
            console.log('Final Data : ', data);
        });
};

waitForElm('section').then(async (elm) => {
    // Initialize tweets storage
    await chrome.storage.sync.remove('tweets');
    await chrome.storage.sync.set({ tweets: [] });

    // Select the node that will be observed for mutations
    const targetNode = document.getElementsByTagName('section')[0];

    // Options for the observer (which mutations to observe)
    const config = { childList: true, subtree: true };

    // Callback function to execute when mutations are observed
    const callback = async (mutationList, observer) => {
        for (const mutation of mutationList) {
            if (mutation.type === 'childList') {
                let results = document.evaluate(
                    '//article[@data-testid="tweet"]//div[@data-testid="tweetText"]',
                    document,
                    null,
                    XPathResult.ANY_TYPE,
                    null
                );

                let tweets = [];

                // Extract tweet text even with icons
                while ((node = results.iterateNext())) {
                    let tweet_text = node.innerHTML
                        .replace(/<img .*?alt="([^"]+)"[^>]*>/g, ' $1 ') // extract alt text from img tag
                        .replace(/<\/?[a-z][^>]*>/g, ' ') // remove all tags
                        .replace(/\s+/g, ' ')
                        .trim(); // cleanup whitespace
                    tweets.push(tweet_text);
                }

                let prev_tweets = await chrome.storage.sync.get(['tweets']);

                if (
                    prev_tweets.tweets &&
                    JSON.stringify(tweets) !==
                        JSON.stringify(prev_tweets.tweets)
                ) {
                    await chrome.storage.sync.set({ tweets: tweets });
                    await language_detection_endpoint(tweets);
                }
            }
        }
    };

    // Create an observer instance linked to the callback function
    const observer = new MutationObserver(callback);

    // Start observing the target node for configured mutations
    observer.observe(targetNode, config);
});
