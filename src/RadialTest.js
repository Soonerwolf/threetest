/*
* RadialTest
* Testing radial output in ThreeJS
*/

import NexradLevel3Parser from "NexradLevel3Parser";

export class RadialTest
{
   constructor(inContainer)
    {
        console.log("RadialTest constructor");
        this.mRadarData = {};
        this.mRadarUrl = "";
        this.mHasData = false;
        this.mStatusContainer = inContainer;
    }

    initFromUrlUsingWorker(inUrl)
    {
        this.mRadarUrl = inUrl;
        const radWorker = new Worker(new URL("RadarWorker.js", import.meta.url));

        radWorker.onmessage = function(workerMessage) {
            console.log("Parse successful");
            this.mRadarData = workerMessage.data;
            // here is where we pepare everything for drawing.
        }
        radWorker.onerror = function(workerError) {
            console.log(workerError.message);
            this.mRadarData = {};
        }
        this.mStatusContainer.innerHTML = "Posting to worker"
        radWorker.postMessage(inUrl);
    }


    async loadFromUrl (inUrl)
    {
        let outBuffer;
        console.log("Attempting to fetch ", inUrl);
        
        try {
            const response = await fetch(inUrl);
            console.log(response);
            if (!response.ok) {
                throw new Error(`Response not ok; status: ${response.status}`);
            }

            const result = await response.arrayBuffer();
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


    parseRadarData (inBuffer)
    {
        let outRadarData = {};
        if (inBuffer.byteLength > 0)
        {
            const parser = new NexradLevel3Parser(inBuffer, {});
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

    async initFromUrl (inUrl)
    {
        this.mRadarUrl = inUrl;
        let radarBuffer = await this.loadFromUrl(this.mRadarUrl);
        if (radarBuffer.byteLength > 0)
        {
            this.mStatusContainer.innerHTML = "Data loaded, parsing...";
            let radarData = this.parseRadarData(radarBuffer);
            if (radarData.numberOfRangeBins > 0)
            {
                this.mRadarData = radarData;
                console.log(radarData);
                //await this.generateRadarImage();
                this.mStatusContainer.innerHTML = "Parsed!"
                
                this.mHasData = true;
            }
        }
        else
        {
            this.mStatusContainer.innerHTML = "radarbuffer.byteLength == 0";
        }
    }

    async generateRadarImage()
    {
        // initial test code
        // build sin/cos arrays

        // generate texture

        // generate mesh

        // generate Three stuff
        return true;
    }

    generateColorTable ()
    {
        const numRadials = this.mRadarData.numberOfRadials;
        const numRangeBins = this.mRadarData.numberOfRangeBins;
    }
}