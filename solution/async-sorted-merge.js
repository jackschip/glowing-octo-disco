"use strict";

// Print all entries, across all of the *async* sources, in chronological order.


const drainSingleLogSource = async (logSource) => {
  const collectedLogs = [];
  let isDrained = logSource.drained;
  while (!isDrained) { // I dont love to use while loops, but given the unknown amount of logs until drained it seems appropriate
    const log = await logSource.popAsync(); // need to await this in order to get passed next line
    if (log) {
      collectedLogs.push(log); // log is valid and source is not drained, continue
    } else {
      isDrained = true; // log is false, we're drained
    }
  }
  return collectedLogs;
}

// initially used quicksort however the worst case was O(n^2) and can be slower for large sets, while the best case is O(nlog(n)) which is standard for merge sort.
const mergeSortedArrays = (arr1, arr2) => { // trustworthy sorting algo to sort large sets quickly O(nlog(n))
  const merged = [];
  let i = 0, j = 0;
  while (i < arr1.length && j < arr2.length) {
    if (arr1[i].date <= arr2[j].date) {
      merged.push(arr1[i++]);
    } else {
      merged.push(arr2[j++]);
    }
  }
  return merged.concat(arr1.slice(i)).concat(arr2.slice(j));
};

module.exports = async (logSources, printer) => {
  const timeA = new Date();
  const logArrays = await Promise.all(logSources.map(drainSingleLogSource)); // grab all log groups
  
  let sortedLogs = logArrays[0] || [];
  for (let i = 1; i < logArrays.length; i++) {
    sortedLogs = mergeSortedArrays(sortedLogs, logArrays[i]); // merge sort logs
  }

  sortedLogs.forEach(log => printer.print(log));
  console.log("Async sort complete.", new Date() - timeA, 'ms');
};
