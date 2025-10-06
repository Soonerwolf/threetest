/*
* RadarWorker
* Load and parse radar data in the background
*/
import NexradLevelThreeParser from "NexradLevel3Parser";


self.onmessage = function (inMessage)
{
    const url = inMessage.data;
    const rawData = fetchUrl(url);
    const radarData = parseRadar(rawData);
    self.postMessage(radarData);
}

function fetchUrl(inUrl)
    {
        let outBuffer;
        console.log("Attempting to fetch ", inUrl);
        
        try {
            const response = fetch(inUrl);
            console.log(response);
            if (!response.ok) {
                throw new Error(`Response not ok; status: ${response.status}`);
            }

            const result = response.arrayBuffer();
            console.log("Result = ", result.byteLength);
            if (result.byteLength > 0)
            {
                outBuffer = result;
            }
        } catch (error) {
            console.error(error.message);
        }
        return outBuffer;
    }

  function parseRadar (inData)
    {
        let outRadarData = {};
        if (inData.byteLength > 0)
        {
            const parser = new NexradLevelThreeParser(inData, {});
            let didParse = parser.parse();
            didParse == 1 ? console.log("Parse! 🥳") : console.log("Did not parse.  🤨");
            outRadarData = parser.parsed.data;
        }
        else
        {
            console.log("radarBuffer is length 0");
        }
        return outRadarData;
    }
