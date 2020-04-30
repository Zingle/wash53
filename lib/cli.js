const globalConsole = console;

class Wash53CLI {
    /**
     * @param {Wash53} wash53
     * @param {Console} [console]
     */
    constructor(wash53, console) {
        this.wash53 = wash53;
        this.console = console || globalConsole;
    }

    async listZones() {
        for await (const {Id: zone} of this.wash53.zones()) {
            this.console.log(zone);
        }
    }
}

module.exports = {Wash53CLI};
