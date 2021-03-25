import types from "../global/pickerTypes";

export default source => `listOf${types[source][0].toUpperCase() + types[source].slice(1)}s`
