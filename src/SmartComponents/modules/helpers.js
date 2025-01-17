import { ASC, DESC } from '../../constants';

function paginateData(data, selectedPage, factsPerPage) {
    let paginatedFacts = [];

    if (data === null || !data.length) {
        return [];
    }

    for (let i = 0; i < data.length; i++) {
        if (Math.ceil((i + 1) / factsPerPage) === selectedPage) {
            paginatedFacts.push(data[i]);
        }
    }

    return paginatedFacts;
}

function getStateSelected(state, stateFilters) {
    let isStateSelected;

    isStateSelected = stateFilters.find(function(stateFilter) {
        if (stateFilter.filter === state) {
            return stateFilter.selected;
        }
    });

    return isStateSelected;
}

function filterCompareData(data, stateFilters, factFilter, newExpandedRows) {
    let filteredFacts = [];
    let filteredComparisons = [];
    let isStateSelected;

    if (data === null || !data.length) {
        return [];
    }

    for (let i = 0; i < data.length; i += 1) {
        isStateSelected = getStateSelected(data[i].state, stateFilters);

        if (data[i].comparisons) {
            if (data[i].name === factFilter) {
                if (newExpandedRows.includes(data[i].name) && isStateSelected) {
                    filteredFacts.push({ name: data[i].name, state: data[i].state, comparisons: data[i].comparisons });
                } else {
                    filteredFacts.push({ name: data[i].name, state: data[i].state, comparisons: []});
                }

                break;
            }

            filteredComparisons = filterComparisons(data[i].comparisons, stateFilters, factFilter);

            if (filteredComparisons.length) {
                if (newExpandedRows.includes(data[i].name)) {
                    filteredFacts.push({ name: data[i].name, state: data[i].state, comparisons: filteredComparisons });
                } else {
                    filteredFacts.push({ name: data[i].name, state: data[i].state, comparisons: []});
                }
            }
        } else {
            if (data[i].name.includes(factFilter)) {
                if (isStateSelected) {
                    filteredFacts.push(data[i]);
                }
            }
        }
    }

    return filteredFacts;
}

function filterComparisons(comparisons, stateFilters, factFilter) {
    let filteredComparisons = [];
    let isStateSelected;

    for (let i = 0; i < comparisons.length; i++) {
        isStateSelected = getStateSelected(comparisons[i].state, stateFilters);

        if (comparisons[i].name.includes(factFilter)) {
            if (isStateSelected) {
                filteredComparisons.push(comparisons[i]);
            }
        }
    }

    return filteredComparisons;
}

function sortData(filteredFacts, factSort, stateSort) {
    let filteredSubfacts;
    let newFilteredFacts;

    newFilteredFacts = sortFacts(filteredFacts, factSort, stateSort);

    newFilteredFacts.forEach(function(fact) {
        if (fact.comparisons !== undefined && fact.comparisons.length > 0) {
            filteredSubfacts = sortFacts(fact.comparisons, factSort, stateSort);
            fact.comparisons = filteredSubfacts;
        }
    });

    return newFilteredFacts;
}

function sortFacts(filteredFacts, factSort, stateSort) {
    if (stateSort === ASC) {
        filteredFacts.sort(function(a, b) {
            if (a.state.toLowerCase() > b.state.toLowerCase()) {
                return -1;
            }
            else if (a.state.toLowerCase() < b.state.toLowerCase()) {
                return 1;
            }
            else {
                return 0;
            }
        });
    }

    if (stateSort === DESC) {
        filteredFacts.sort(function(a, b) {
            if (b.state.toLowerCase() > a.state.toLowerCase()) {
                return -1;
            }
            else if (b.state.toLowerCase() < a.state.toLowerCase()) {
                return 1;
            }
            else {
                return 0;
            }
        });
    }

    if (factSort === ASC) {
        filteredFacts.sort(function(a, b) {
            if (stateSort === '') {
                if (a.name.toLowerCase() > b.name.toLowerCase()) {
                    return 1;
                }
                else if (a.name.toLowerCase() < b.name.toLowerCase()) {
                    return -1;
                }
                else {
                    return 0;
                }
            }
            else {
                if ((a.name.toLowerCase() > b.name.toLowerCase()) && (a.state === b.state)) {
                    return 1;
                }
                else if ((a.name.toLowerCase() < b.name.toLowerCase()) && (a.state === b.state)) {
                    return -1;
                }
                else {
                    return 0;
                }
            }
        });
    }
    else if (factSort === DESC) {
        filteredFacts.sort(function(a, b) {
            if (stateSort === '') {
                if (b.name.toLowerCase() > a.name.toLowerCase()) {
                    return 1;
                }
                else if (b.name.toLowerCase() < a.name.toLowerCase()) {
                    return -1;
                }
                else {
                    return 0;
                }
            }
            else {
                if ((b.name.toLowerCase() > a.name.toLowerCase()) && (a.state === b.state)) {
                    return 1;
                }
                else if ((b.name.toLowerCase() < a.name.toLowerCase()) && (a.state === b.state)) {
                    return -1;
                }
                else {
                    return 0;
                }
            }
        });
    }

    return filteredFacts;
}

function convertFactsToCSV(data, systems) {
    if (data === null || !data.length) {
        return null;
    }

    let columnDelimiter = data.columnDelimiter || ',';
    let lineDelimiter = data.lineDelimiter || '\n';

    let systemNames = systems.map(system => system.display_name);

    let headers = 'Fact,State,';
    systemNames = systemNames.join(columnDelimiter);
    let result = headers + systemNames + lineDelimiter;

    let comparisons;

    data.forEach(function(fact) {
        let keys = Object.keys(fact);
        keys.forEach(function(key, index) {
            if (index > 0) {
                result += columnDelimiter;
            }

            if (key === 'systems') {
                fact[key].forEach(function(system) {
                    let value = system.value ? system.value.replace(/,/g, '') : '';
                    result += value;
                    result += columnDelimiter;
                });
                result += lineDelimiter;
            } else if (key === 'comparisons') {
                if (fact.comparisons.length) {
                    result += lineDelimiter;
                    comparisons = fact.comparisons;
                    comparisons.forEach(function(fact) {
                        keys = Object.keys(fact);
                        keys.forEach(function(key, index) {
                            if (index > 0) {
                                result += columnDelimiter;
                            }

                            if (key === 'systems') {
                                fact[key].forEach(function(system) {
                                    let value = system.value ? system.value.replace(/,/g, '') : '';
                                    result += value;
                                    result += columnDelimiter;
                                });
                                result += lineDelimiter;
                            } else {
                                if (key === 'name') {
                                    result += '    ';
                                }

                                result += fact[key];
                            }
                        });
                    });
                } else {
                    result += lineDelimiter;
                }
            } else {
                result += fact[key];
            }
        });
    });

    return result;
}

function downloadCSV(driftData, systems) {
    let csv = convertFactsToCSV(driftData, systems);

    if (csv === null) {
        return;
    }

    let filename = 'system-comparison-export-';
    let today = new Date();
    filename += today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    filename += '_';
    filename += today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds();
    filename += '.csv';

    if (!csv.match(/^data:text\/csv/i)) {
        csv = 'data:text/csv;charset=utf-8,' + csv;
    }

    let data = encodeURI(csv);

    let link = document.createElement('a');
    link.setAttribute('href', data);
    link.setAttribute('download', filename);
    link.dispatchEvent(new MouseEvent(`click`, { bubbles: true, cancelable: true, view: window }));
}

function toggleExpandedRow(expandedRows, factName) {
    if (expandedRows.includes(factName)) {
        expandedRows = expandedRows.filter(fact => fact !== factName);
    } else {
        expandedRows.push(factName);
    }

    return expandedRows;
}

function updateStateFilters(stateFilters, updatedStateFilter) {
    let newStateFilters = [];

    stateFilters.forEach(function (stateFilter) {
        if (stateFilter.filter === updatedStateFilter.filter) {
            newStateFilters.push(updatedStateFilter);
        } else {
            newStateFilters.push(stateFilter);
        }
    });

    return newStateFilters;
}

export default {
    paginateData,
    filterCompareData,
    sortData,
    downloadCSV,
    toggleExpandedRow,
    updateStateFilters
};
