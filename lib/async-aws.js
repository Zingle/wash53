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

    static readTags(tags) {
        if (!Array.isArray(tags) && tags.Tags) {
            return AsyncAWS.readTags(tags.Tags);
        }

        return tags.reduce((tags, tag) => {
            tags[tag.Key] = tag.Value;
            return tags;
        }, {});
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
    let pageOpts = {};

    do {
        const opts = Object.assign({}, options, pageOpts);
        const page = await fn(opts).promise();
        const {[key]: results} = page;

        yield* results;

        pageOpts = next(page);
    } while (pageOpts);
}

function next(page) {
    const keys = Object.keys(page).filter(key => /^Next[A-Z]/.test(key));

    return keys.reduce((opts, key) => {
        const startKey = key.replace("Next", "Start");
        return Object.assign(opts || {}, {[startKey]: page[key]});
    }, undefined);
}

function initializeRegion(aws, region) {
    if (!aws.ec2[region]) {
        aws.ec2[region] = new (aws.aws.EC2)({region});
    }
}
