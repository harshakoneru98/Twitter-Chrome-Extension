exports.language_detection = async (req, res, next) => {
    try {
        res.status(200).json({ message: 'Called Language Detection API' });
    } catch (err) {
        res.status(500).json({
            message: err
        });
    }
};

exports.sentiment_score = async (req, res, next) => {
    try {
        res.status(200).json({ message: 'Called Sentiment Score API' });
    } catch (error) {
        res.status(500).json({
            message: err
        });
    }
};
