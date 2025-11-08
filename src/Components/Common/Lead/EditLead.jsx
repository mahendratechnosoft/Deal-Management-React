import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Select from "react-select";
import { Country, State, City } from "country-state-city";
import { useLayout } from "../../Layout/useLayout";
import { toast } from "react-hot-toast";
import axiosInstance from "../../BaseComponet/axiosInstance";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";

function EditLead() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { LayoutComponent, role } = useLayout();
  const [employeeId, setEmployeeId] = useState("");

  const [formData, setFormData] = useState({
    companyName: "",
    assignTo: "",
    status: "",
    source: "",
    clientName: "",
    revenue: "",
    mobileNumber: "",
    phoneNumber: "",
    email: "",
    website: "",
    industry: "",
    priority: "",
    street: "",
    country: "",
    state: "",
    city: "",
    zipCode: "",
    description: "",
  });

  // Simplified phone states
  const [phoneData, setPhoneData] = useState({
    mobileNumber: "",
    phoneNumber: "",
  });

  const [dropdownData, setDropdownData] = useState({
    countries: [],
    states: [],
    cities: [],
  });

  const [errors, setErrors] = useState({});

  const countryDigitLimits = {
    // North America
    us: 10, // United States
    ca: 10, // Canada

    // Europe
    gb: 10, // United Kingdom
    de: 10, // Germany
    fr: 9, // France
    it: 10, // Italy
    es: 9, // Spain
    nl: 9, // Netherlands
    be: 9, // Belgium
    ch: 9, // Switzerland
    at: 10, // Austria
    se: 9, // Sweden
    no: 8, // Norway
    dk: 8, // Denmark
    fi: 9, // Finland
    pl: 9, // Poland
    cz: 9, // Czech Republic
    sk: 9, // Slovakia
    hu: 9, // Hungary
    ro: 9, // Romania
    bg: 9, // Bulgaria
    gr: 10, // Greece
    pt: 9, // Portugal
    ie: 9, // Ireland
    lu: 9, // Luxembourg
    ee: 7, // Estonia
    lv: 8, // Latvia
    lt: 8, // Lithuania
    si: 8, // Slovenia
    hr: 9, // Croatia
    rs: 9, // Serbia
    ba: 8, // Bosnia and Herzegovina
    mk: 8, // North Macedonia
    al: 9, // Albania
    me: 8, // Montenegro

    // Asia
    in: 10, // India
    cn: 11, // China
    jp: 10, // Japan
    kr: 9, // South Korea
    hk: 8, // Hong Kong
    tw: 9, // Taiwan
    sg: 8, // Singapore
    my: 9, // Malaysia
    th: 9, // Thailand
    id: 9, // Indonesia
    ph: 10, // Philippines
    vn: 9, // Vietnam
    mm: 9, // Myanmar
    kh: 8, // Cambodia
    la: 8, // Laos
    bn: 7, // Brunei
    np: 10, // Nepal
    lk: 9, // Sri Lanka
    bd: 10, // Bangladesh
    pk: 10, // Pakistan
    af: 9, // Afghanistan
    kz: 10, // Kazakhstan
    uz: 9, // Uzbekistan
    kg: 9, // Kyrgyzstan
    tj: 9, // Tajikistan
    tm: 8, // Turkmenistan

    // Middle East
    sa: 9, // Saudi Arabia
    ae: 9, // United Arab Emirates
    il: 9, // Israel
    tr: 10, // Turkey
    ir: 10, // Iran
    iq: 10, // Iraq
    jo: 9, // Jordan
    lb: 8, // Lebanon
    kw: 8, // Kuwait
    om: 8, // Oman
    qa: 8, // Qatar
    bh: 8, // Bahrain
    ye: 9, // Yemen
    sy: 9, // Syria

    // Africa
    eg: 10, // Egypt
    za: 9, // South Africa
    ng: 10, // Nigeria
    ke: 9, // Kenya
    et: 9, // Ethiopia
    gh: 9, // Ghana
    ci: 10, // Ivory Coast
    sn: 9, // Senegal
    cm: 9, // Cameroon
    ug: 9, // Uganda
    tz: 9, // Tanzania
    zw: 9, // Zimbabwe
    mz: 9, // Mozambique
    mg: 9, // Madagascar
    ao: 9, // Angola
    sd: 9, // Sudan
    dz: 9, // Algeria
    ma: 9, // Morocco
    tn: 8, // Tunisia
    ly: 9, // Libya

    // Oceania
    au: 9, // Australia
    nz: 9, // New Zealand
    fj: 7, // Fiji
    pg: 8, // Papua New Guinea

    // Latin America
    br: 11, // Brazil
    mx: 10, // Mexico
    ar: 10, // Argentina
    co: 10, // Colombia
    pe: 9, // Peru
    ve: 10, // Venezuela
    cl: 9, // Chile
    ec: 9, // Ecuador
    bo: 8, // Bolivia
    py: 9, // Paraguay
    uy: 8, // Uruguay
    cr: 8, // Costa Rica
    pa: 8, // Panama
    do: 10, // Dominican Republic
    gt: 8, // Guatemala
    sv: 8, // El Salvador
    hn: 8, // Honduras
    ni: 8, // Nicaragua
    pr: 10, // Puerto Rico
    cu: 8, // Cuba
    jm: 10, // Jamaica
    ht: 8, // Haiti

    // Caribbean
    tt: 10, // Trinidad and Tobago
    bb: 10, // Barbados
    bs: 10, // Bahamas
    lc: 10, // Saint Lucia
    vc: 10, // Saint Vincent and the Grenadines
    gd: 10, // Grenada
    dm: 10, // Dominica
    kn: 10, // Saint Kitts and Nevis
    ag: 10, // Antigua and Barbuda

    gf: 9, // French Guiana
    gp: 9, // Guadeloupe
    mq: 9, // Martinique
    re: 9, // Réunion
    yt: 9, // Mayotte

    // Other
    ru: 10, // Russia
    ua: 9, // Ukraine
    by: 9, // Belarus
    md: 8, // Moldova
    am: 8, // Armenia
    az: 9, // Azerbaijan
    ge: 9, // Georgia
    is: 7, // Iceland
    mt: 8, // Malta
    cy: 8, // Cyprus
    li: 7, // Liechtenstein
    mc: 8, // Monaco
    sm: 10, // San Marino
    va: 10, // Vatican City
    ad: 6, // Andorra
  };

  const getDigitLimit = (countryCode) => {
    const code = countryCode ? countryCode.toLowerCase() : "in";
    return countryDigitLimits[code] || 10; // Default to 10 if country not found
  };

  // COMPLETE: Extract country code from international phone number
  const extractCountryCode = (phoneNumber) => {
    if (!phoneNumber || !phoneNumber.startsWith("+")) return "in";

    // Complete country code mapping
    const countryCodes = {
      "+1": "us", // USA/Canada
      "+1242": "bs", // Bahamas
      "+1246": "bb", // Barbados
      "+1264": "ai", // Anguilla
      "+1268": "ag", // Antigua and Barbuda
      "+1284": "vg", // British Virgin Islands
      "+1340": "vi", // US Virgin Islands
      "+1441": "bm", // Bermuda
      "+1473": "gd", // Grenada
      "+1649": "tc", // Turks and Caicos
      "+1664": "ms", // Montserrat
      "+1670": "mp", // Northern Mariana Islands
      "+1671": "gu", // Guam
      "+1684": "as", // American Samoa
      "+1758": "lc", // Saint Lucia
      "+1767": "dm", // Dominica
      "+1784": "vc", // Saint Vincent and the Grenadines
      "+1787": "pr", // Puerto Rico
      "+1809": "do", // Dominican Republic
      "+1868": "tt", // Trinidad and Tobago
      "+1869": "kn", // Saint Kitts and Nevis
      "+1876": "jm", // Jamaica
      "+1939": "pr", // Puerto Rico
      "+20": "eg", // Egypt
      "+211": "ss", // South Sudan
      "+212": "ma", // Morocco
      "+213": "dz", // Algeria
      "+216": "tn", // Tunisia
      "+218": "ly", // Libya
      "+220": "gm", // Gambia
      "+221": "sn", // Senegal
      "+222": "mr", // Mauritania
      "+223": "ml", // Mali
      "+224": "gn", // Guinea
      "+225": "ci", // Ivory Coast
      "+226": "bf", // Burkina Faso
      "+227": "ne", // Niger
      "+228": "tg", // Togo
      "+229": "bj", // Benin
      "+230": "mu", // Mauritius
      "+231": "lr", // Liberia
      "+232": "sl", // Sierra Leone
      "+233": "gh", // Ghana
      "+234": "ng", // Nigeria
      "+235": "td", // Chad
      "+236": "cf", // Central African Republic
      "+237": "cm", // Cameroon
      "+238": "cv", // Cape Verde
      "+239": "st", // Sao Tome and Principe
      "+240": "gq", // Equatorial Guinea
      "+241": "ga", // Gabon
      "+242": "cg", // Republic of the Congo
      "+243": "cd", // DR Congo
      "+244": "ao", // Angola
      "+245": "gw", // Guinea-Bissau
      "+246": "io", // British Indian Ocean Territory
      "+248": "sc", // Seychelles
      "+249": "sd", // Sudan
      "+250": "rw", // Rwanda
      "+251": "et", // Ethiopia
      "+252": "so", // Somalia
      "+253": "dj", // Djibouti
      "+254": "ke", // Kenya
      "+255": "tz", // Tanzania
      "+256": "ug", // Uganda
      "+257": "bi", // Burundi
      "+258": "mz", // Mozambique
      "+260": "zm", // Zambia
      "+261": "mg", // Madagascar
      "+262": "re", // Reunion
      "+263": "zw", // Zimbabwe
      "+264": "na", // Namibia
      "+265": "mw", // Malawi
      "+266": "ls", // Lesotho
      "+267": "bw", // Botswana
      "+268": "sz", // Eswatini
      "+269": "km", // Comoros
      "+27": "za", // South Africa
      "+290": "sh", // Saint Helena
      "+291": "er", // Eritrea
      "+297": "aw", // Aruba
      "+298": "fo", // Faroe Islands
      "+299": "gl", // Greenland
      "+30": "gr", // Greece
      "+31": "nl", // Netherlands
      "+32": "be", // Belgium
      "+33": "fr", // France
      "+34": "es", // Spain
      "+350": "gi", // Gibraltar
      "+351": "pt", // Portugal
      "+352": "lu", // Luxembourg
      "+353": "ie", // Ireland
      "+354": "is", // Iceland
      "+355": "al", // Albania
      "+356": "mt", // Malta
      "+357": "cy", // Cyprus
      "+358": "fi", // Finland
      "+359": "bg", // Bulgaria
      "+36": "hu", // Hungary
      "+370": "lt", // Lithuania
      "+371": "lv", // Latvia
      "+372": "ee", // Estonia
      "+373": "md", // Moldova
      "+374": "am", // Armenia
      "+375": "by", // Belarus
      "+376": "ad", // Andorra
      "+377": "mc", // Monaco
      "+378": "sm", // San Marino
      "+379": "va", // Vatican City
      "+380": "ua", // Ukraine
      "+381": "rs", // Serbia
      "+382": "me", // Montenegro
      "+383": "xk", // Kosovo
      "+385": "hr", // Croatia
      "+386": "si", // Slovenia
      "+387": "ba", // Bosnia and Herzegovina
      "+389": "mk", // North Macedonia
      "+39": "it", // Italy
      "+40": "ro", // Romania
      "+41": "ch", // Switzerland
      "+420": "cz", // Czech Republic
      "+421": "sk", // Slovakia
      "+423": "li", // Liechtenstein
      "+43": "at", // Austria
      "+44": "gb", // UK
      "+45": "dk", // Denmark
      "+46": "se", // Sweden
      "+47": "no", // Norway
      "+48": "pl", // Poland
      "+49": "de", // Germany
      "+500": "fk", // Falkland Islands
      "+501": "bz", // Belize
      "+502": "gt", // Guatemala
      "+503": "sv", // El Salvador
      "+504": "hn", // Honduras
      "+505": "ni", // Nicaragua
      "+506": "cr", // Costa Rica
      "+507": "pa", // Panama
      "+508": "pm", // Saint Pierre and Miquelon
      "+509": "ht", // Haiti
      "+51": "pe", // Peru
      "+52": "mx", // Mexico
      "+53": "cu", // Cuba
      "+54": "ar", // Argentina
      "+55": "br", // Brazil
      "+56": "cl", // Chile
      "+57": "co", // Colombia
      "+58": "ve", // Venezuela
      "+590": "gp", // Guadeloupe
      "+591": "bo", // Bolivia
      "+592": "gy", // Guyana
      "+593": "ec", // Ecuador
      "+594": "gf", // French Guiana
      "+595": "py", // Paraguay
      "+596": "mq", // Martinique
      "+597": "sr", // Suriname
      "+598": "uy", // Uruguay
      "+599": "cw", // Curacao
      "+60": "my", // Malaysia
      "+61": "au", // Australia
      "+62": "id", // Indonesia
      "+63": "ph", // Philippines
      "+64": "nz", // New Zealand
      "+65": "sg", // Singapore
      "+66": "th", // Thailand
      "+670": "tl", // Timor-Leste
      "+672": "nf", // Norfolk Island
      "+673": "bn", // Brunei
      "+674": "nr", // Nauru
      "+675": "pg", // Papua New Guinea
      "+676": "to", // Tonga
      "+677": "sb", // Solomon Islands
      "+678": "vu", // Vanuatu
      "+679": "fj", // Fiji
      "+680": "pw", // Palau
      "+681": "wf", // Wallis and Futuna
      "+682": "ck", // Cook Islands
      "+683": "nu", // Niue
      "+685": "ws", // Samoa
      "+686": "ki", // Kiribati
      "+687": "nc", // New Caledonia
      "+688": "tv", // Tuvalu
      "+689": "pf", // French Polynesia
      "+690": "tk", // Tokelau
      "+691": "fm", // Micronesia
      "+692": "mh", // Marshall Islands
      "+7": "ru", // Russia
      "+81": "jp", // Japan
      "+82": "kr", // South Korea
      "+84": "vn", // Vietnam
      "+850": "kp", // North Korea
      "+852": "hk", // Hong Kong
      "+853": "mo", // Macau
      "+855": "kh", // Cambodia
      "+856": "la", // Laos
      "+86": "cn", // China
      "+880": "bd", // Bangladesh
      "+886": "tw", // Taiwan
      "+90": "tr", // Turkey
      "+91": "in", // India
      "+92": "pk", // Pakistan
      "+93": "af", // Afghanistan
      "+94": "lk", // Sri Lanka
      "+95": "mm", // Myanmar
      "+960": "mv", // Maldives
      "+961": "lb", // Lebanon
      "+962": "jo", // Jordan
      "+963": "sy", // Syria
      "+964": "iq", // Iraq
      "+965": "kw", // Kuwait
      "+966": "sa", // Saudi Arabia
      "+967": "ye", // Yemen
      "+968": "om", // Oman
      "+970": "ps", // Palestine
      "+971": "ae", // UAE
      "+972": "il", // Israel
      "+973": "bh", // Bahrain
      "+974": "qa", // Qatar
      "+975": "bt", // Bhutan
      "+976": "mn", // Mongolia
      "+977": "np", // Nepal
      "+98": "ir", // Iran
      "+992": "tj", // Tajikistan
      "+993": "tm", // Turkmenistan
      "+994": "az", // Azerbaijan
      "+995": "ge", // Georgia
      "+996": "kg", // Kyrgyzstan
      "+998": "uz", // Uzbekistan
    };

    // Sort by code length (longest first) to avoid partial matches
    const sortedCodes = Object.keys(countryCodes).sort(
      (a, b) => b.length - a.length
    );

    for (const code of sortedCodes) {
      if (phoneNumber.startsWith(code)) {
        return countryCodes[code];
      }
    }

    return "us"; // Default to US if no match found
  };
  // COMPLETE: Get country name for error messages
  // COMPLETE: Get country name for error messages
  const getCountryName = (countryCode) => {
    const countryNames = {
      // Asia
      in: "India",
      cn: "China",
      jp: "Japan",
      kr: "South Korea",
      hk: "Hong Kong",
      tw: "Taiwan",
      sg: "Singapore",
      my: "Malaysia",
      th: "Thailand",
      id: "Indonesia",
      ph: "Philippines",
      vn: "Vietnam",
      mm: "Myanmar",
      kh: "Cambodia",
      la: "Laos",
      bn: "Brunei",
      np: "Nepal",
      lk: "Sri Lanka",
      bd: "Bangladesh",
      pk: "Pakistan",
      af: "Afghanistan",
      kz: "Kazakhstan",
      uz: "Uzbekistan",
      kg: "Kyrgyzstan",
      tj: "Tajikistan",
      tm: "Turkmenistan",
      mn: "Mongolia",
      bt: "Bhutan",
      mv: "Maldives",

      // Middle East
      sa: "Saudi Arabia",
      ae: "United Arab Emirates",
      il: "Israel",
      tr: "Turkey",
      ir: "Iran",
      iq: "Iraq",
      jo: "Jordan",
      lb: "Lebanon",
      kw: "Kuwait",
      om: "Oman",
      qa: "Qatar",
      bh: "Bahrain",
      ye: "Yemen",
      sy: "Syria",
      ps: "Palestine",

      // North America
      us: "United States",
      ca: "Canada",
      mx: "Mexico",

      // Europe
      gb: "United Kingdom",
      de: "Germany",
      fr: "France",
      it: "Italy",
      es: "Spain",
      nl: "Netherlands",
      be: "Belgium",
      ch: "Switzerland",
      at: "Austria",
      se: "Sweden",
      no: "Norway",
      dk: "Denmark",
      fi: "Finland",
      pl: "Poland",
      cz: "Czech Republic",
      sk: "Slovakia",
      hu: "Hungary",
      ro: "Romania",
      bg: "Bulgaria",
      gr: "Greece",
      pt: "Portugal",
      ie: "Ireland",
      lu: "Luxembourg",
      ee: "Estonia",
      lv: "Latvia",
      lt: "Lithuania",
      si: "Slovenia",
      hr: "Croatia",
      rs: "Serbia",
      ba: "Bosnia and Herzegovina",
      mk: "North Macedonia",
      al: "Albania",
      me: "Montenegro",
      is: "Iceland",
      mt: "Malta",
      cy: "Cyprus",
      li: "Liechtenstein",
      mc: "Monaco",
      sm: "San Marino",
      va: "Vatican City",
      ad: "Andorra",
      by: "Belarus",
      md: "Moldova",
      ua: "Ukraine",
      ru: "Russia",

      // Africa
      eg: "Egypt",
      za: "South Africa",
      ng: "Nigeria",
      ke: "Kenya",
      et: "Ethiopia",
      gh: "Ghana",
      ci: "Ivory Coast",
      sn: "Senegal",
      cm: "Cameroon",
      ug: "Uganda",
      tz: "Tanzania",
      zw: "Zimbabwe",
      mz: "Mozambique",
      mg: "Madagascar",
      ao: "Angola",
      sd: "Sudan",
      dz: "Algeria",
      ma: "Morocco",
      tn: "Tunisia",
      ly: "Libya",
      rw: "Rwanda",
      bi: "Burundi",
      so: "Somalia",
      er: "Eritrea",
      dj: "Djibouti",
      sl: "Sierra Leone",
      lr: "Liberia",
      ml: "Mali",
      ne: "Niger",
      td: "Chad",
      cf: "Central African Republic",
      cd: "DR Congo",
      cg: "Republic of the Congo",
      ga: "Gabon",
      gm: "Gambia",
      gw: "Guinea-Bissau",
      mr: "Mauritania",
      bf: "Burkina Faso",
      bj: "Benin",
      tg: "Togo",
      cv: "Cape Verde",
      st: "Sao Tome and Principe",
      gq: "Equatorial Guinea",
      sz: "Eswatini",
      ls: "Lesotho",
      bw: "Botswana",
      na: "Namibia",
      zm: "Zambia",
      mw: "Malawi",
      km: "Comoros",
      mu: "Mauritius",
      sc: "Seychelles",

      // Oceania
      au: "Australia",
      nz: "New Zealand",
      fj: "Fiji",
      pg: "Papua New Guinea",
      sb: "Solomon Islands",
      vu: "Vanuatu",
      nr: "Nauru",
      ki: "Kiribati",
      tv: "Tuvalu",
      ws: "Samoa",
      to: "Tonga",
      fm: "Micronesia",
      mh: "Marshall Islands",
      pw: "Palau",
      ck: "Cook Islands",
      nu: "Niue",
      tk: "Tokelau",
      pf: "French Polynesia",
      nc: "New Caledonia",

      // Latin America & Caribbean
      br: "Brazil",
      ar: "Argentina",
      co: "Colombia",
      pe: "Peru",
      ve: "Venezuela",
      cl: "Chile",
      ec: "Ecuador",
      bo: "Bolivia",
      py: "Paraguay",
      uy: "Uruguay",
      cr: "Costa Rica",
      pa: "Panama",
      do: "Dominican Republic",
      gt: "Guatemala",
      sv: "El Salvador",
      hn: "Honduras",
      ni: "Nicaragua",
      pr: "Puerto Rico",
      cu: "Cuba",
      jm: "Jamaica",
      ht: "Haiti",
      tt: "Trinidad and Tobago",
      bb: "Barbados",
      bs: "Bahamas",
      lc: "Saint Lucia",
      vc: "Saint Vincent and the Grenadines",
      gd: "Grenada",
      dm: "Dominica",
      kn: "Saint Kitts and Nevis",
      ag: "Antigua and Barbuda",
    };

    return countryNames[countryCode] || countryCode.toUpperCase();
  };
  // Parse phone number from your format (+91)7732032039
  const parsePhoneNumber = (phoneString) => {
    if (!phoneString) return { country: "in", number: "" };

    console.log("Parsing phone:", phoneString);

    // Handle format: (+91)7732032039 or (+91) 7732032039
    const match = phoneString.match(/\(\+(\d+)\)\s*(\d+)/);
    if (match && match[1] && match[2]) {
      const countryCode = match[1];
      const localNumber = match[2];

      // Map country dial codes to country codes
      // COMPLETE dial code to country mapping (for validation)
      const dialCodeToCountry = {
        // Asia
        91: "in",
        86: "cn",
        81: "jp",
        82: "kr",
        852: "hk",
        886: "tw",
        65: "sg",
        60: "my",
        66: "th",
        62: "id",
        63: "ph",
        84: "vn",
        95: "mm",
        855: "kh",
        856: "la",
        673: "bn",
        977: "np",
        94: "lk",
        880: "bd",
        92: "pk",
        93: "af",
        7: "kz",
        998: "uz",
        996: "kg",
        992: "tj",
        993: "tm",
        976: "mn",
        975: "bt",
        960: "mv",

        // Middle East
        966: "sa",
        971: "ae",
        972: "il",
        90: "tr",
        98: "ir",
        964: "iq",
        962: "jo",
        961: "lb",
        965: "kw",
        968: "om",
        974: "qa",
        973: "bh",
        967: "ye",
        963: "sy",
        970: "ps",

        // North America
        1: "us",
        52: "mx",

        // Europe
        44: "gb",
        49: "de",
        33: "fr",
        39: "it",
        34: "es",
        31: "nl",
        32: "be",
        41: "ch",
        43: "at",
        46: "se",
        47: "no",
        45: "dk",
        358: "fi",
        48: "pl",
        420: "cz",
        421: "sk",
        36: "hu",
        40: "ro",
        359: "bg",
        30: "gr",
        351: "pt",
        353: "ie",
        352: "lu",
        372: "ee",
        371: "lv",
        370: "lt",
        386: "si",
        385: "hr",
        381: "rs",
        387: "ba",
        389: "mk",
        355: "al",
        382: "me",
        354: "is",
        356: "mt",
        357: "cy",
        423: "li",
        377: "mc",
        378: "sm",
        379: "va",
        376: "ad",
        375: "by",
        373: "md",
        380: "ua",
        7: "ru",

        // Africa
        20: "eg",
        27: "za",
        234: "ng",
        254: "ke",
        251: "et",
        233: "gh",
        225: "ci",
        221: "sn",
        237: "cm",
        256: "ug",
        255: "tz",
        263: "zw",
        258: "mz",
        261: "mg",
        244: "ao",
        249: "sd",
        213: "dz",
        212: "ma",
        216: "tn",
        218: "ly",
        250: "rw",
        257: "bi",
        252: "so",
        291: "er",
        253: "dj",
        232: "sl",
        231: "lr",
        223: "ml",
        227: "ne",
        235: "td",
        236: "cf",
        243: "cd",
        242: "cg",
        241: "ga",
        220: "gm",
        245: "gw",
        222: "mr",
        226: "bf",
        229: "bj",
        228: "tg",
        238: "cv",
        239: "st",
        240: "gq",
        268: "sz",
        266: "ls",
        267: "bw",
        264: "na",
        260: "zm",
        265: "mw",
        269: "km",
        230: "mu",
        248: "sc",

        // Oceania
        61: "au",
        64: "nz",
        679: "fj",
        675: "pg",
        677: "sb",
        678: "vu",
        674: "nr",
        686: "ki",
        688: "tv",
        685: "ws",
        676: "to",
        691: "fm",
        692: "mh",
        680: "pw",
        682: "ck",
        683: "nu",
        690: "tk",
        689: "pf",
        687: "nc",

        // Latin America & Caribbean
        55: "br",
        54: "ar",
        57: "co",
        51: "pe",
        58: "ve",
        56: "cl",
        593: "ec",
        591: "bo",
        595: "py",
        598: "uy",
        506: "cr",
        507: "pa",
        1: "do",
        502: "gt",
        503: "sv",
        504: "hn",
        505: "ni",
        1: "pr",
        53: "cu",
        1: "jm",
        509: "ht",
        1: "tt",
        1: "bb",
        1: "bs",
        1: "lc",
        1: "vc",
        1: "gd",
        1: "dm",
        1: "kn",
        1: "ag",
      };
      const country = dialCodeToCountry[countryCode] || "in";
      const fullNumber = `+${countryCode}${localNumber}`;

      console.log("Parsed result:", { country, fullNumber, localNumber });
      return { country, number: fullNumber };
    }

    // If it's already in international format
    if (phoneString.startsWith("+")) {
      // Extract country code from the number itself
      const countryFromNumber = phoneString.startsWith("+91")
        ? "in"
        : phoneString.startsWith("+1")
        ? "us"
        : phoneString.startsWith("+44")
        ? "gb"
        : "in";
      return { country: countryFromNumber, number: phoneString };
    }

    // Default to India
    return { country: "in", number: phoneString };
  };

// UPDATED: Format phone number for your backend: (+91)7744998493
const formatPhoneForBackend = (phoneString) => {
  if (!phoneString) return "";

  console.log("Formatting for backend:", phoneString);

  // If it's already in our format, return as is
  if (phoneString.match(/\(\+\d+\)\d+/)) {
    return phoneString;
  }

  // Remove ALL spaces from the input first
  const cleanPhoneString = phoneString.replace(/\s/g, '');
  console.log("Cleaned phone string:", cleanPhoneString);

  // Handle international format using extractCountryCode
  if (cleanPhoneString.startsWith("+")) {
    const countryCode = extractCountryCode(cleanPhoneString);
    console.log("Detected country:", countryCode);

    // Remove the + and get the dial code
    const withoutPlus = cleanPhoneString.substring(1);

    // Get the dial code from the country code mapping (reverse lookup)
    const countryToDialCode = {
      // Asia
      in: "91", cn: "86", jp: "81", kr: "82", hk: "852", tw: "886",
      sg: "65", my: "60", th: "66", id: "62", ph: "63", vn: "84",
      mm: "95", kh: "855", la: "856", bn: "673", np: "977", lk: "94",
      bd: "880", pk: "92", af: "93", kz: "7", uz: "998", kg: "996",
      tj: "992", tm: "993", mn: "976", bt: "975", mv: "960",

      // Middle East
      sa: "966", ae: "971", il: "972", tr: "90", ir: "98", iq: "964",
      jo: "962", lb: "961", kw: "965", om: "968", qa: "974", bh: "973",
      ye: "967", sy: "963", ps: "970",

      // North America
      us: "1", ca: "1", mx: "52",

      // Europe
      gb: "44", de: "49", fr: "33", it: "39", es: "34", nl: "31",
      be: "32", ch: "41", at: "43", se: "46", no: "47", dk: "45",
      fi: "358", pl: "48", cz: "420", sk: "421", hu: "36", ro: "40",
      bg: "359", gr: "30", pt: "351", ie: "353", lu: "352", ee: "372",
      lv: "371", lt: "370", si: "386", hr: "385", rs: "381", ba: "387",
      mk: "389", al: "355", me: "382", is: "354", mt: "356", cy: "357",
      li: "423", mc: "377", sm: "378", va: "379", ad: "376", by: "375",
      md: "373", ua: "380", ru: "7",

      // Africa
      eg: "20", za: "27", ng: "234", ke: "254", et: "251", gh: "233",
      ci: "225", sn: "221", cm: "237", ug: "256", tz: "255", zw: "263",
      mz: "258", mg: "261", ao: "244", sd: "249", dz: "213", ma: "212",
      tn: "216", ly: "218", rw: "250", bi: "257", so: "252", er: "291",
      dj: "253", sl: "232", lr: "231", ml: "223", ne: "227", td: "235",
      cf: "236", cd: "243", cg: "242", ga: "241", gm: "220", gw: "245",
      mr: "222", bf: "226", bj: "229", tg: "228", cv: "238", st: "239",
      gq: "240", sz: "268", ls: "266", bw: "267", na: "264", zm: "260",
      mw: "265", km: "269", mu: "230", sc: "248",

      // Oceania
      au: "61", nz: "64", fj: "679", pg: "675", sb: "677", vu: "678",
      nr: "674", ki: "686", tv: "688", ws: "685", to: "676", fm: "691",
      mh: "692", pw: "680", ck: "682", nu: "683", tk: "690", pf: "689",
      nc: "687",

      // Latin America & Caribbean
      br: "55", ar: "54", co: "57", pe: "51", ve: "58", cl: "56",
      ec: "593", bo: "591", py: "595", uy: "598", cr: "506", pa: "507",
      do: "1", gt: "502", sv: "503", hn: "504", ni: "505", pr: "1",
      cu: "53", jm: "1", ht: "509", tt: "1", bb: "1", bs: "1",
      lc: "1", vc: "1", gd: "1", dm: "1", kn: "1", ag: "1",

      // French Guiana (GF)
      gf: "594"
    };

    const dialCode = countryToDialCode[countryCode];

    if (dialCode && withoutPlus.startsWith(dialCode)) {
      const localNumber = withoutPlus.substring(dialCode.length);
      const formatted = `(+${dialCode})${localNumber}`;
      console.log("Successfully formatted:", {
        input: phoneString,
        cleanInput: cleanPhoneString,
        dialCode,
        localNumber,
        formatted,
      });
      return formatted;
    }

    // Fallback: try to extract using the complete country codes mapping
    const completeCountryCodes = {
      // Asia
      "+91": "in", "+86": "cn", "+81": "jp", "+82": "kr", "+852": "hk", "+886": "tw",
      "+65": "sg", "+60": "my", "+66": "th", "+62": "id", "+63": "ph", "+84": "vn",
      "+95": "mm", "+855": "kh", "+856": "la", "+673": "bn", "+977": "np", "+94": "lk",
      "+880": "bd", "+92": "pk", "+93": "af", "+7": "kz", "+998": "uz", "+996": "kg",
      "+992": "tj", "+993": "tm", "+976": "mn", "+975": "bt", "+960": "mv",

      // Middle East
      "+966": "sa", "+971": "ae", "+972": "il", "+90": "tr", "+98": "ir", "+964": "iq",
      "+962": "jo", "+961": "lb", "+965": "kw", "+968": "om", "+974": "qa", "+973": "bh",
      "+967": "ye", "+963": "sy", "+970": "ps",

      // North America
      "+1": "us", "+52": "mx",

      // Europe
      "+44": "gb", "+49": "de", "+33": "fr", "+39": "it", "+34": "es", "+31": "nl",
      "+32": "be", "+41": "ch", "+43": "at", "+46": "se", "+47": "no", "+45": "dk",
      "+358": "fi", "+48": "pl", "+420": "cz", "+421": "sk", "+36": "hu", "+40": "ro",
      "+359": "bg", "+30": "gr", "+351": "pt", "+353": "ie", "+352": "lu", "+372": "ee",
      "+371": "lv", "+370": "lt", "+386": "si", "+385": "hr", "+381": "rs", "+387": "ba",
      "+389": "mk", "+355": "al", "+382": "me", "+354": "is", "+356": "mt", "+357": "cy",
      "+423": "li", "+377": "mc", "+378": "sm", "+379": "va", "+376": "ad", "+375": "by",
      "+373": "md", "+380": "ua", "+7": "ru",

      // Africa
      "+20": "eg", "+27": "za", "+234": "ng", "+254": "ke", "+251": "et", "+233": "gh",
      "+225": "ci", "+221": "sn", "+237": "cm", "+256": "ug", "+255": "tz", "+263": "zw",
      "+258": "mz", "+261": "mg", "+244": "ao", "+249": "sd", "+213": "dz", "+212": "ma",
      "+216": "tn", "+218": "ly", "+250": "rw", "+257": "bi", "+252": "so", "+291": "er",
      "+253": "dj", "+232": "sl", "+231": "lr", "+223": "ml", "+227": "ne", "+235": "td",
      "+236": "cf", "+243": "cd", "+242": "cg", "+241": "ga", "+220": "gm", "+245": "gw",
      "+222": "mr", "+226": "bf", "+229": "bj", "+228": "tg", "+238": "cv", "+239": "st",
      "+240": "gq", "+268": "sz", "+266": "ls", "+267": "bw", "+264": "na", "+260": "zm",
      "+265": "mw", "+269": "km", "+230": "mu", "+248": "sc",

      // Oceania
      "+61": "au", "+64": "nz", "+679": "fj", "+675": "pg", "+677": "sb", "+678": "vu",
      "+674": "nr", "+686": "ki", "+688": "tv", "+685": "ws", "+676": "to", "+691": "fm",
      "+692": "mh", "+680": "pw", "+682": "ck", "+683": "nu", "+690": "tk", "+689": "pf",
      "+687": "nc",

      // Latin America & Caribbean
      "+55": "br", "+54": "ar", "+57": "co", "+51": "pe", "+58": "ve", "+56": "cl",
      "+593": "ec", "+591": "bo", "+595": "py", "+598": "uy", "+506": "cr", "+507": "pa",
      "+1": "do", "+502": "gt", "+503": "sv", "+504": "hn", "+505": "ni", "+1": "pr",
      "+53": "cu", "+1": "jm", "+509": "ht", "+1": "tt", "+1": "bb", "+1": "bs",
      "+1": "lc", "+1": "vc", "+1": "gd", "+1": "dm", "+1": "kn", "+1": "ag",

      // French Guiana
      "+594": "gf"
    };

    for (const [code, country] of Object.entries(completeCountryCodes)) {
      if (cleanPhoneString.startsWith(code)) {
        const dialCode = code.substring(1); // Remove the +
        const localNumber = cleanPhoneString.substring(code.length);
        const formatted = `(+${dialCode})${localNumber}`;
        console.log("Formatted using complete mapping:", {
          input: phoneString,
          cleanInput: cleanPhoneString,
          dialCode,
          localNumber,
          formatted,
        });
        return formatted;
      }
    }
  }

  console.log("Could not format phone:", phoneString);
  return phoneString;
};



  // Handle phone change - IMPROVED
  const handlePhoneChange = (value, type = "mobile") => {
    console.log("Phone changed:", { type, value });

    // Format for backend storage
    const formattedNumber = formatPhoneForBackend(value);

    console.log("Formatted result:", {
      input: value,
      formatted: formattedNumber,
    });

    if (type === "mobile") {
      setPhoneData((prev) => ({ ...prev, mobileNumber: value }));
      setFormData((prev) => ({
        ...prev,
        mobileNumber: formattedNumber,
      }));
    } else {
      setPhoneData((prev) => ({ ...prev, phoneNumber: value }));
      setFormData((prev) => ({
        ...prev,
        phoneNumber: formattedNumber || "", // Ensure empty string if null
      }));
    }

    // Clear errors for the specific field
    if (type === "mobile" && errors.mobileNumber) {
      setErrors((prev) => ({
        ...prev,
        mobileNumber: "",
      }));
    } else if (type === "phone" && errors.phoneNumber) {
      setErrors((prev) => ({
        ...prev,
        phoneNumber: "",
      }));
    }
  };

  // Initialize countries
  useEffect(() => {
    const countries = Country.getAllCountries().map((country) => ({
      value: country.isoCode,
      label: country.name,
      phonecode: country.phonecode,
      flag: country.flag,
    }));

    setDropdownData((prev) => ({
      ...prev,
      countries,
    }));
  }, []);

  const findCountryCodeByName = (countryName) => {
    const countries = Country.getAllCountries();
    const country = countries.find((c) => c.name === countryName);
    return country ? country.isoCode : "";
  };

  const findStateCodeByName = (stateName, countryCode) => {
    const states = State.getStatesOfCountry(countryCode);
    const state = states.find((s) => s.name === stateName);
    return state ? state.isoCode : "";
  };

  // Fetch lead data
  useEffect(() => {
    const fetchLeadData = async () => {
      if (!id) {
        toast.error("Lead ID not found!");
        navigateBasedOnRole();
        return;
      }

      setIsLoading(true);
      try {
        const response = await axiosInstance.get(`getLeadById/${id}`);
        const apiResponse = response.data;
        const leadData = apiResponse.lead;

        console.log("Fetched lead data:", leadData);

        if (!leadData) {
          toast.error("Lead data not found in response!");
          navigateBasedOnRole();
          return;
        }

        if (leadData.employeeId) {
          setEmployeeId(leadData.employeeId);
        }

        // Map API response to form data
        const mappedFormData = {
          companyName: leadData.companyName || "",
          assignTo: leadData.assignTo || "",
          status: leadData.status || "New Lead",
          source: leadData.source || "",
          clientName: leadData.clientName || "",
          revenue: leadData.revenue ? leadData.revenue.toString() : "",
          mobileNumber: leadData.mobileNumber || "",
          phoneNumber: leadData.phoneNumber || "",
          email: leadData.email || "",
          website: leadData.website || "",
          industry: leadData.industry || "",
          priority: leadData.priority || "",
          street: leadData.street || "",
          country: leadData.country || "",
          state: leadData.state || "",
          city: leadData.city || "",
          zipCode: leadData.zipCode || "",
          description: leadData.description || "",
          createdDate: leadData.createdDate,
          updatedDate: leadData.updatedDate,
        };

        setFormData(mappedFormData);

        // Parse and set phone numbers
        console.log("Setting up phone data:", {
          mobileNumber: leadData.mobileNumber,
          phoneNumber: leadData.phoneNumber,
        });

        if (leadData.mobileNumber) {
          const parsedMobile = parsePhoneNumber(leadData.mobileNumber);
          console.log("Mobile setup:", {
            original: leadData.mobileNumber,
            parsed: parsedMobile,
          });
          setPhoneData((prev) => ({
            ...prev,
            mobileNumber: parsedMobile.number,
          }));
        }

        if (leadData.phoneNumber) {
          const parsedPhone = parsePhoneNumber(leadData.phoneNumber);
          console.log("Phone setup:", {
            original: leadData.phoneNumber,
            parsed: parsedPhone,
          });
          setPhoneData((prev) => ({
            ...prev,
            phoneNumber: parsedPhone.number,
          }));
        }

        // Handle country-state-city dropdowns
        if (leadData.country) {
          const countryCode = findCountryCodeByName(leadData.country);
          console.log("Country setup:", {
            original: leadData.country,
            code: countryCode,
          });

          if (countryCode) {
            const states = State.getStatesOfCountry(countryCode).map(
              (state) => ({
                value: state.isoCode,
                label: state.name,
              })
            );

            setDropdownData((prev) => ({
              ...prev,
              states,
            }));

            setFormData((prev) => ({
              ...prev,
              country: countryCode,
            }));

            if (leadData.state) {
              const stateCode = findStateCodeByName(
                leadData.state,
                countryCode
              );
              console.log("State setup:", {
                original: leadData.state,
                code: stateCode,
              });

              if (stateCode) {
                const cities = City.getCitiesOfState(
                  countryCode,
                  stateCode
                ).map((city) => ({
                  value: city.name,
                  label: city.name,
                }));

                setDropdownData((prev) => ({
                  ...prev,
                  cities,
                }));

                setFormData((prev) => ({
                  ...prev,
                  state: stateCode,
                }));
              }
            }
          }
        }
      } catch (error) {
        console.error("Error fetching lead:", error);
        handleFetchError(error);
      } finally {
        setIsLoading(false);
      }
    };

    const navigateBasedOnRole = () => {
      if (role === "ROLE_ADMIN") {
        navigate("/Admin/LeadList");
      } else if (role === "ROLE_EMPLOYEE") {
        navigate("/Employee/LeadList");
      }
    };

    const handleFetchError = (error) => {
      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        navigate("/login");
        return;
      }

      if (
        error.name === "TypeError" &&
        error.message.includes("Failed to fetch")
      ) {
        toast.error(
          "Cannot connect to server. Please check if the backend is running."
        );
      } else {
        toast.error("Failed to fetch lead data. Please try again.");
      }
      navigateBasedOnRole();
    };

    fetchLeadData();
  }, [id, navigate, role]);

  // Validation function - FIXED
  const validateForm = () => {
    const newErrors = {};

    // Add debug logging to see what's happening
    console.log("Validation debug - phone fields:", {
      mobileNumber: formData.mobileNumber,
      phoneNumber: formData.phoneNumber,
      mobileExists: !!formData.mobileNumber?.trim(),
      phoneExists: !!formData.phoneNumber?.trim(),
      phoneTrimmed: formData.phoneNumber?.trim(),
    });

    // Basic field validation
    if (!formData.clientName?.trim())
      newErrors.clientName = "Client name is required";
    if (!formData.companyName?.trim())
      newErrors.companyName = "Company name is required";

    // Primary number validation
    if (!formData.mobileNumber?.trim()) {
      newErrors.mobileNumber = "Primary number is required";
    } else {
      // Check if the stored format contains spaces (invalid format)
      if (/\s/.test(formData.mobileNumber)) {
        newErrors.mobileNumber = "Phone number should not contain spaces";
      } else {
        // Extract country code and local number from format: (+91)7744998493
        const match = formData.mobileNumber.match(/\(\+(\d+)\)(\d+)/);

        if (match && match[1] && match[2]) {
          const countryDialCode = match[1];
          const localNumber = match[2];

          // Use the SAME extractCountryCode logic to get country code
          const countryCode = extractCountryCode(`+${countryDialCode}`);
          const requiredLength = getDigitLimit(countryCode);

          console.log("Primary validation:", {
            storedValue: formData.mobileNumber,
            countryDialCode,
            localNumber,
            localNumberLength: localNumber.length,
            requiredLength,
            countryCode,
          });

          if (localNumber.length !== requiredLength) {
            newErrors.mobileNumber = `Phone number must be exactly ${requiredLength} digits for ${getCountryName(
              countryCode
            )}`;
          }
        } else {
          console.log(
            "Invalid mobile format - actual value:",
            formData.mobileNumber
          );
          newErrors.mobileNumber =
            "Invalid phone number format. Expected format: (+91)1234567890";
        }
      }
    }

    // Secondary number validation - SIMPLIFIED AND FIXED
    // Only validate if phoneNumber exists and is not empty/whitespace
    const secondaryPhone = formData.phoneNumber?.trim();
    if (secondaryPhone && secondaryPhone.length > 0) {
      console.log("Validating secondary phone:", secondaryPhone);

      // Check if the stored format contains spaces (invalid format)
      if (/\s/.test(formData.phoneNumber)) {
        newErrors.phoneNumber = "Phone number should not contain spaces";
      } else {
        const match = formData.phoneNumber.match(/\(\+(\d+)\)(\d+)/);

        if (match && match[1] && match[2]) {
          const countryDialCode = match[1];
          const localNumber = match[2];

          // Use the SAME extractCountryCode logic to get country code
          const countryCode = extractCountryCode(`+${countryDialCode}`);
          const requiredLength = getDigitLimit(countryCode);

          console.log("Secondary validation:", {
            storedValue: formData.phoneNumber,
            countryDialCode,
            localNumber,
            localNumberLength: localNumber.length,
            requiredLength,
            countryCode,
          });

          if (localNumber.length !== requiredLength) {
            newErrors.phoneNumber = `Phone number must be exactly ${requiredLength} digits for ${getCountryName(
              countryCode
            )}`;
          }
        } else {
          console.log(
            "Invalid phone format - actual value:",
            formData.phoneNumber
          );
          newErrors.phoneNumber =
            "Invalid phone number format. Expected format: (+91)1234567890";
        }
      }
    } else {
      console.log("Secondary phone is empty, skipping validation");
      // Don't add any error for phoneNumber - it's optional and empty
    }

    // Rest of validation
    if (formData.state && !formData.country) {
      newErrors.country = "Country is required when state is selected";
    }
    if (formData.city && !formData.state) {
      newErrors.state = "State is required when city is selected";
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    setErrors(newErrors);

    // Clear phoneNumber error if it exists in state but not in newErrors
    if (errors.phoneNumber && !newErrors.phoneNumber) {
      setTimeout(() => {
        setErrors((prev) => ({ ...prev, phoneNumber: "" }));
      }, 0);
    }

    return Object.keys(newErrors).length === 0;
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSelectChange = (selectedOption, { name }) => {
    setFormData((prev) => ({
      ...prev,
      [name]: selectedOption ? selectedOption.value : "",
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const submitData = {
        id: id,
        companyName: formData.companyName,
        assignTo: formData.assignTo,
        status: formData.status,
        source: formData.source,
        clientName: formData.clientName,
        revenue: formData.revenue ? parseFloat(formData.revenue) : 0,
        mobileNumber: formData.mobileNumber || null,
        phoneNumber: formData.phoneNumber || null,
        email: formData.email || null,
        website: formData.website || null,
        industry: formData.industry || null,
        priority: formData.priority || null,
        street: formData.street,
        country: formData.country
          ? dropdownData.countries.find((c) => c.value === formData.country)
              ?.label
          : "",
        state: formData.state
          ? dropdownData.states.find((s) => s.value === formData.state)?.label
          : "",
        city: formData.city,
        zipCode: formData.zipCode,
        description: formData.description,
        createdDate: formData.createdDate,
        updatedDate: new Date().toISOString(),
      };

      if (role === "ROLE_EMPLOYEE" && employeeId) {
        submitData.employeeId = employeeId;
      }

      console.log("Updating lead with data:", submitData);

      await axiosInstance.put("updateLead", submitData);

      toast.success("Lead updated successfully!");
      if (role === "ROLE_ADMIN") {
        navigate("/Admin/LeadList");
      } else if (role === "ROLE_EMPLOYEE") {
        navigate("/Employee/LeadList");
      }
    } catch (error) {
      console.error("Error updating lead:", error);
      if (error.response?.data?.message) {
        toast.error(`Failed to update lead: ${error.response.data.message}`);
      } else if (
        error.name === "TypeError" &&
        error.message.includes("Failed to fetch")
      ) {
        toast.error(
          "Cannot connect to server. Please check if the backend is running."
        );
      } else {
        toast.error("Failed to update lead. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (
      window.confirm(
        "Are you sure you want to cancel? Any unsaved changes will be lost."
      )
    ) {
      if (role === "ROLE_ADMIN") {
        navigate("/Admin/LeadList");
      } else if (role === "ROLE_EMPLOYEE") {
        navigate("/Employee/LeadList");
      }
    }
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset all changes?")) {
      window.location.reload();
    }
  };

  const customStyles = {
    control: (base) => ({
      ...base,
      minHeight: "32px",
      borderColor:
        errors.country || errors.state || errors.city ? "#ef4444" : "#d1d5db",
      "&:hover": {
        borderColor:
          errors.country || errors.state || errors.city ? "#ef4444" : "#3b82f6",
      },
    }),
    menu: (base) => ({
      ...base,
      zIndex: 50,
    }),
  };

  const handleCountryChange = (selectedOption) => {
    const countryCode = selectedOption ? selectedOption.value : "";

    setFormData((prev) => ({
      ...prev,
      country: countryCode,
      state: "",
      city: "",
      zipCode: "",
    }));

    if (countryCode) {
      const states = State.getStatesOfCountry(countryCode).map((state) => ({
        value: state.isoCode,
        label: state.name,
      }));

      setDropdownData((prev) => ({
        ...prev,
        states,
        cities: [],
      }));
    } else {
      setDropdownData((prev) => ({
        ...prev,
        states: [],
        cities: [],
      }));
    }

    if (errors.country || errors.state || errors.city) {
      setErrors((prev) => ({
        ...prev,
        country: "",
        state: "",
        city: "",
      }));
    }
  };

  const handleStateChange = (selectedOption) => {
    const stateCode = selectedOption ? selectedOption.value : "";

    setFormData((prev) => ({
      ...prev,
      state: stateCode,
      city: "",
      zipCode: "",
    }));

    if (stateCode && formData.country) {
      const cities = City.getCitiesOfState(formData.country, stateCode).map(
        (city) => ({
          value: city.name,
          label: city.name,
        })
      );

      setDropdownData((prev) => ({
        ...prev,
        cities,
      }));
    } else {
      setDropdownData((prev) => ({
        ...prev,
        cities: [],
      }));
    }

    if (errors.state || errors.city) {
      setErrors((prev) => ({
        ...prev,
        state: "",
        city: "",
      }));
    }
  };

  const handleCityChange = (selectedOption) => {
    const cityName = selectedOption ? selectedOption.value : "";

    setFormData((prev) => ({
      ...prev,
      city: cityName,
    }));

    if (errors.city) {
      setErrors((prev) => ({
        ...prev,
        city: "",
      }));
    }
  };
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <LayoutComponent>
          <div className=" bg-gray-50 border-b border-gray-200 overflow-x-auto h-[90vh] overflow-y-auto CRM-scroll-width-none">
            {/* Header Skeleton */}
            <div className="mb-6">
              <div className="skeleton h-4 w-32 mb-2"></div>
              <div className="skeleton h-8 w-64 mb-2"></div>
              <div className="skeleton h-4 w-48"></div>
            </div>

            {/* Form Skeleton */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {/* Section Header Skeleton */}
              <div className="flex items-center gap-3 mb-6">
                <div className="skeleton w-8 h-8 rounded-lg"></div>
                <div className="skeleton h-6 w-48"></div>
              </div>

              {/* Form Fields Skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="space-y-2">
                    <div className="skeleton h-4 w-24"></div>
                    <div className="skeleton h-10 w-full"></div>
                  </div>
                ))}
              </div>

              {/* Address Section Skeleton */}
              <div className="flex items-center gap-3 mb-6">
                <div className="skeleton w-8 h-8 rounded-lg"></div>
                <div className="skeleton h-6 w-32"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {[...Array(4)].map((_, index) => (
                  <div key={index} className="space-y-2">
                    <div className="skeleton h-4 w-20"></div>
                    <div className="skeleton h-10 w-full"></div>
                  </div>
                ))}
              </div>

              {/* Lead Details Skeleton */}
              <div className="flex items-center gap-3 mb-6">
                <div className="skeleton w-8 h-8 rounded-lg"></div>
                <div className="skeleton h-6 w-36"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {[...Array(4)].map((_, index) => (
                  <div key={index} className="space-y-2">
                    <div className="skeleton h-4 w-28"></div>
                    <div className="skeleton h-10 w-full"></div>
                  </div>
                ))}
              </div>

              {/* Description Skeleton */}
              <div className="flex items-center gap-3 mb-6">
                <div className="skeleton w-8 h-8 rounded-lg"></div>
                <div className="skeleton h-6 w-40"></div>
              </div>
              <div className="skeleton h-32 w-full"></div>
            </div>
          </div>
        </LayoutComponent>

        <style jsx>{`
          .skeleton {
            background: linear-gradient(
              90deg,
              #f0f0f0 25%,
              #e0e0e0 50%,
              #f0f0f0 75%
            );
            background-size: 200% 100%;
            animation: loading 1.5s infinite;
            border-radius: 4px;
          }

          @keyframes loading {
            0% {
              background-position: 200% 0;
            }
            100% {
              background-position: -200% 0;
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <LayoutComponent>
      <div className="p-4 bg-gray-50 border-b border-gray-200 overflow-x-auto h-[90vh] overflow-y-auto CRM-scroll-width-none">
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={() => {
                if (role === "ROLE_ADMIN") {
                  navigate("/Admin/LeadList");
                } else if (role === "ROLE_EMPLOYEE") {
                  navigate("/Employee/LeadList");
                }
              }}
              className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Leads
            </button>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Edit Lead</h1>
              <p className="text-gray-600 text-sm">
                Update lead information for {formData.clientName}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200 text-sm font-medium"
              >
                Reset
              </button>
              <button
                type="submit"
                form="editLeadForm"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-200 text-sm font-medium flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  "Updating..."
                ) : (
                  <>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Update Lead
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <form id="editLeadForm" onSubmit={handleSubmit} className="p-6">
                <div className="space-y-6">
                  <section>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900">
                          Basic Information
                        </h2>
                      </div>
                    </div>
                  </section>

                  <section>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="relative">
                        <input
                          type="text"
                          name="clientName"
                          value={formData.clientName}
                          onChange={handleChange}
                          className={`w-full px-3 py-2 border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm peer ${
                            errors.clientName
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                          placeholder=" "
                        />
                        <label className="absolute left-3 -top-2.5 bg-white px-1 text-sm text-gray-600 transition-all duration-200 peer-placeholder-shown:top-2 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600 pointer-events-none">
                          Client Name *
                        </label>
                        {errors.clientName && (
                          <p className="mt-1 text-xs text-red-600">
                            {errors.clientName}
                          </p>
                        )}
                      </div>

                      <div className="relative">
                        <input
                          type="text"
                          name="companyName"
                          value={formData.companyName}
                          onChange={handleChange}
                          className={`w-full px-3 py-2 border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm peer ${
                            errors.companyName
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                          placeholder=" "
                        />
                        <label className="absolute left-3 -top-2.5 bg-white px-1 text-sm text-gray-600 transition-all duration-200 peer-placeholder-shown:top-2 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600 pointer-events-none">
                          Company Name *
                        </label>
                        {errors.companyName && (
                          <p className="mt-1 text-xs text-red-600">
                            {errors.companyName}
                          </p>
                        )}
                      </div>

                      {/* Mobile Number */}
                      <div className="relative">
                        <div
                          className={`phone-input-wrapper ${
                            errors.mobileNumber ? "border-red-500 rounded" : ""
                          }`}
                        >
                          <PhoneInput
                            defaultCountry="in"
                            value={phoneData.mobileNumber}
                            onChange={(value) =>
                              handlePhoneChange(value, "mobile")
                            }
                            placeholder="Enter primary phone number"
                            inputClassName={`w-full h-10 px-3 border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                              errors.mobileNumber
                                ? "border-red-500"
                                : "border-gray-300"
                            }`}
                          />
                        </div>
                        <label className="absolute left-3 -top-2.5 bg-white px-1 text-sm text-gray-600 pointer-events-none">
                          Primary Number *
                        </label>
                        {errors.mobileNumber && (
                          <p className="mt-1 text-xs text-red-600">
                            {errors.mobileNumber}
                          </p>
                        )}
                        {formData.mobileNumber && (
                          <p className="mt-1 text-xs text-gray-500">
                            {getCountryName(
                              extractCountryCode(phoneData.mobileNumber)
                            )}{" "}
                            format:{" "}
                            {getDigitLimit(
                              extractCountryCode(phoneData.mobileNumber)
                            )}{" "}
                            digits
                          </p>
                        )}
                      </div>

                      {/* Phone Number */}
                      <div className="relative">
                        <div
                          className={`phone-input-wrapper ${
                            errors.phoneNumber ? "border-red-500 rounded" : ""
                          }`}
                        >
                          <PhoneInput
                            defaultCountry="in"
                            value={phoneData.phoneNumber}
                            onChange={(value) =>
                              handlePhoneChange(value, "phone")
                            }
                            placeholder="Enter secondary phone number"
                            inputClassName={`w-full h-10 px-3 border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                              errors.phoneNumber
                                ? "border-red-500"
                                : "border-gray-300"
                            }`}
                          />
                        </div>
                        <label className="absolute left-3 -top-2.5 bg-white px-1 text-sm text-gray-600 pointer-events-none">
                          Secondary Number
                        </label>
                        {errors.phoneNumber && (
                          <p className="mt-1 text-xs text-red-600">
                            {errors.phoneNumber}
                          </p>
                        )}
                        {formData.phoneNumber && (
                          <p className="mt-1 text-xs text-gray-500">
                            {getCountryName(
                              extractCountryCode(phoneData.phoneNumber)
                            )}{" "}
                            format:{" "}
                            {getDigitLimit(
                              extractCountryCode(phoneData.phoneNumber)
                            )}{" "}
                            digits
                          </p>
                        )}
                      </div>

                      <div className="relative">
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className={`w-full px-3 py-2 border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm peer ${
                            errors.email ? "border-red-500" : "border-gray-300"
                          }`}
                          placeholder=" "
                        />
                        <label className="absolute left-3 -top-2.5 bg-white px-1 text-sm text-gray-600 transition-all duration-200 peer-placeholder-shown:top-2 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600 pointer-events-none">
                          Email
                        </label>
                        {errors.email && (
                          <p className="mt-1 text-xs text-red-600">
                            {errors.email}
                          </p>
                        )}
                      </div>

                      <div className="relative">
                        <input
                          type="text"
                          name="website"
                          value={formData.website}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm peer"
                          placeholder=" "
                        />
                        <label className="absolute left-3 -top-2.5 bg-white px-1 text-sm text-gray-600 transition-all duration-200 peer-placeholder-shown:top-2 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600 pointer-events-none">
                          Website
                        </label>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div className="md:col-span-2 relative">
                        <input
                          type="text"
                          name="street"
                          value={formData.street}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm peer"
                          placeholder=" "
                        />
                        <label className="absolute left-3 -top-2.5 bg-white px-1 text-sm text-gray-600 transition-all duration-200 peer-placeholder-shown:top-2 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600 pointer-events-none">
                          Street
                        </label>
                      </div>

                      <div className="relative">
                        <Select
                          name="country"
                          value={dropdownData.countries.find(
                            (option) => option.value === formData.country
                          )}
                          onChange={handleCountryChange}
                          options={dropdownData.countries}
                          placeholder=" "
                          isSearchable
                          styles={customStyles}
                        />
                        <label className="absolute left-3 -top-2.5 bg-white px-1 text-sm text-gray-600 transition-all duration-200 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600 z-10 pointer-events-none">
                          Country
                        </label>
                        {errors.country && (
                          <p className="mt-1 text-xs text-red-600">
                            {errors.country}
                          </p>
                        )}
                      </div>

                      <div className="relative">
                        <Select
                          key={`state-${formData.country}`}
                          name="state"
                          value={dropdownData.states.find(
                            (option) => option.value === formData.state
                          )}
                          onChange={handleStateChange}
                          options={dropdownData.states}
                          placeholder=" "
                          isSearchable
                          isDisabled={!formData.country}
                          styles={customStyles}
                        />
                        <label className="absolute left-3 -top-2.5 bg-white px-1 text-sm text-gray-600 transition-all duration-200 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600 z-10 pointer-events-none">
                          State
                        </label>
                        {errors.state && (
                          <p className="mt-1 text-xs text-red-600">
                            {errors.state}
                          </p>
                        )}
                      </div>

                      <div className="relative">
                        <Select
                          key={`city-${formData.state}`}
                          name="city"
                          value={dropdownData.cities.find(
                            (option) => option.value === formData.city
                          )}
                          onChange={handleCityChange}
                          options={dropdownData.cities}
                          placeholder=" "
                          isSearchable
                          isDisabled={!formData.state}
                          styles={customStyles}
                        />
                        <label className="absolute left-3 -top-2.5 bg-white px-1 text-sm text-gray-600 transition-all duration-200 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600 z-10 pointer-events-none">
                          City
                        </label>
                        {errors.city && (
                          <p className="mt-1 text-xs text-red-600">
                            {errors.city}
                          </p>
                        )}
                      </div>

                      <div className="relative">
                        <input
                          type="text"
                          name="zipCode"
                          value={formData.zipCode}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm peer"
                          placeholder=" "
                        />
                        <label className="absolute left-3 -top-2.5 bg-white px-1 text-sm text-gray-600 transition-all duration-200 peer-placeholder-shown:top-2 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600 pointer-events-none">
                          ZIP Code
                        </label>
                      </div>
                    </div>
                  </section>

                  <section>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                          />
                        </svg>
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900">
                          Lead Details
                        </h2>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="relative">
                        <select
                          name="status"
                          value={formData.status}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm peer appearance-none bg-white"
                        >
                          <option value="New Lead">New Lead</option>
                          <option value="Contacted">Contacted</option>
                          <option value="Qualified">Qualified</option>
                          <option value="Proposal">Proposal</option>
                          <option value="Negotiation">Negotiation</option>
                          <option value="Won">Won</option>
                          <option value="Lost">Lost</option>
                        </select>
                        <label className="absolute left-3 -top-2.5 bg-white px-1 text-sm text-gray-600 transition-all duration-200 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600">
                          Status
                        </label>
                        {/* Dropdown arrow icon */}
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </div>
                      </div>
                      <div className="relative">
                        <select
                          name="source"
                          value={formData.source}
                          onChange={handleChange}
                          className={`w-full px-3 py-2 border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm peer appearance-none bg-white ${
                            errors.source ? "border-red-500" : "border-gray-300"
                          }`}
                        >
                          <option value="">Select Source</option>
                          <option value="Instagram">Instagram</option>
                          <option value="Website">Website</option>
                          <option value="Referral">Referral</option>
                          <option value="Social Media">Social Media</option>
                          <option value="Trade Show">Trade Show</option>
                          <option value="Email Campaign">Email Campaign</option>
                        </select>
                        <label className="absolute left-3 -top-2.5 bg-white px-1 text-sm text-gray-600 transition-all duration-200 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600">
                          Lead Source *
                        </label>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </div>
                        {errors.source && (
                          <p className="mt-1 text-xs text-red-600">
                            {errors.source}
                          </p>
                        )}
                      </div>

                      <div className="relative">
                        <select
                          name="industry"
                          value={formData.industry}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm peer appearance-none bg-white"
                        >
                          <option value="">Select Industry</option>
                          <option value="Technology">Technology</option>
                          <option value="Healthcare">Healthcare</option>
                          <option value="Finance">Finance</option>
                          <option value="Education">Education</option>
                          <option value="Manufacturing">Manufacturing</option>
                          <option value="Retail">Retail</option>
                          <option value="Real Estate">Real Estate</option>
                          <option value="Other">Other</option>
                        </select>
                        <label className="absolute left-3 -top-2.5 bg-white px-1 text-sm text-gray-600 transition-all duration-200 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600">
                          Industry
                        </label>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </div>
                      </div>

                      <div className="relative">
                        <select
                          name="priority"
                          value={formData.priority}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm peer appearance-none bg-white"
                        >
                          <option value="">Select Priority</option>
                          <option value="Low">Low</option>
                          <option value="Medium">Medium</option>
                          <option value="High">High</option>
                          <option value="Urgent">Urgent</option>
                        </select>
                        <label className="absolute left-3 -top-2.5 bg-white px-1 text-sm text-gray-600 transition-all duration-200 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600">
                          Priority
                        </label>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-8 h-8 bg-gray-600 rounded-lg flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                          />
                        </svg>
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900">
                          Description
                        </h2>
                      </div>
                    </div>

                    <div>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none"
                        placeholder="Enter additional notes or description"
                      />
                    </div>
                  </section>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </LayoutComponent>
  );
}

export default EditLead;
