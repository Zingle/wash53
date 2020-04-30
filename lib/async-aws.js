// used when API requires region, but doesn't care what it is
const NO_REGION = "us-east-1";

class AsyncAWS {
    /**
     * @param {AWS} aws
     */
    constructor(sdk) {
        this.aws = sdk;
        this.route53 = new sdk.Route53();
        this.ec2 = {};
        this.ec2[NO_REGION] = new sdk.EC2({region: NO_REGION});

        Object.freeze(this);
    }

    async *instances(region) {
        initializeRegion(this, region);

        const fn = (...args) => this.ec2[region].describeInstances(...args);
        const key = "Reservations";

        for await (const reservation of paginate(fn, key)) {
            yield* reservation.Instances;
        }
    }

    async *records(zone) {
        const fn = (...args) => this.route53.listResourceRecordSets(...args);
        const key = "ResourceRecordSets";
        const options = {HostedZoneId: zone};
        yield* paginate(fn, key, options);
    }

    async *regions() {
        const ec2 = this.ec2[NO_REGION];
        const result = await ec2.describeRegions().promise();
        yield* result.Regions.map(region => region.RegionName);
    }

    async *zones() {
        const fn = (...args) => this.route53.listHostedZones(...args);
        const key = "HostedZones";
        yield* paginate(fn, key);
    }
}

module.exports = {AsyncAWS};

async function* paginate(fn, key, options={}) {
    let next, nextKey;

    do {
        const pageOpts = nextKey ? {[nextKey]: next} : {};
        const opts = Object.assign({}, options, pageOpts);
        const page = await fn(opts).promise();
        const {[key]: results, NextRecordName, NextToken} = page;

        yield* results;

        next = NextRecordName || NextToken;
        nextKey = NextRecordName?"NextRecordName" : NextToken?"NextToken" : "";
    } while (nextKey);
}

function initializeRegion(aws, region) {
    if (!aws.ec2[region]) {
        aws.ec2[region] = new (aws.aws.EC2)({region});
    }
}
