require('./proof')(1, function (step, serialize, deepEqual, Strata, tmp) {
    var mvcc = require('../..')
    function extractor (record) {
        return record.value
    }
    function comparator (a, b) {
        return a < b ? -1 : a > b ? 1 : 0
    }
    var strata = new Strata({
        extractor: mvcc.extractor(extractor),
        comparator: mvcc.comparator(comparator),
        leafSize: 3, branchSize: 3,
        directory: tmp
    })
    step(function () {
        serialize(__dirname + '/fixtures/nine.json', tmp, step())
    }, function () {
        strata.open(step())
    }, function () {
        mvcc.reverse(strata, comparator, { 0: true }, 'i', step())
    }, function (iterator) {
        var records = []
        step(function () {
            step(function () {
                iterator.next(step())
            }, function (record) {
                if (record) records.push(record.value)
                else step(null, records)
            })()
        }, function () {
            iterator.unlock()
            strata.close(step())
        }, function () {
            return records
        })
    }, function (records) {
        deepEqual(records, [ 'i', 'h', 'g', 'f', 'e', 'd', 'c', 'b', 'a' ], 'records')
    })
})