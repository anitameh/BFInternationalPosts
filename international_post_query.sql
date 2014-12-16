SELECT 
    c.campaignid,
    c.name,
	c.uri,
	c.timestamp,
    c.language,
    GROUP_CONCAT(tc.language),
    COUNT(tc.buzz_id)
FROM
    campaign AS c
        INNER JOIN
    translated_campaigns AS tc ON tc.buzz_id = c.campaignid
WHERE
    YEAR(c.published) = 2014 and c.language = 'en'
GROUP BY c.campaignid;