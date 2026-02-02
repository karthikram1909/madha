import React, { useState, useEffect } from 'react';
import UserDashboardLayout from '../components/user-dashboard/UserDashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Loader2, CheckCircle, Save, Upload, X, Camera } from 'lucide-react';
import { toast } from 'sonner';
import { Link, useNavigate } from "react-router-dom";


// Countries data with states
const COUNTRIES_DATA = {
    "India": {
        "code": "IN",
        "states": {
            "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool", "Rajahmundry", "Tirupati", "Kadapa", "Kakinada", "Anantapur"],
            "Arunachal Pradesh": ["Itanagar", "Naharlagun", "Pasighat", "Bomdila", "Tawang", "Ziro", "Along", "Tezu", "Seppa", "Khonsa"],
            "Assam": ["Guwahati", "Silchar", "Dibrugarh", "Jorhat", "Nagaon", "Tinsukia", "Tezpur", "Bongaigaon", "Karimganj", "Sivasagar"],
            "Bihar": ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Purnia", "Darbhanga", "Bihar Sharif", "Arrah", "Begusarai", "Katihar"],
            "Chhattisgarh": ["Raipur", "Bhilai", "Korba", "Bilaspur", "Durg", "Rajnandgaon", "Jagdalpur", "Raigarh", "Ambikapur", "Mahasamund"],
            "Delhi": ["New Delhi", "Central Delhi", "North Delhi", "South Delhi", "East Delhi", "West Delhi", "North West Delhi", "North East Delhi", "South West Delhi", "Shahdara"],
            "Goa": ["Panaji", "Vasco da Gama", "Margao", "Mapusa", "Ponda", "Mormugao", "Curchorem", "Bicholim", "Canacona", "Cuncolim"],
            "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar", "Gandhinagar", "Junagadh", "Gandhidham", "Anand"],
            "Haryana": ["Faridabad", "Gurgaon", "Panipat", "Ambala", "Yamunanagar", "Rohtak", "Hisar", "Karnal", "Sonipat", "Panchkula"],
            "Himachal Pradesh": ["Shimla", "Solan", "Dharamshala", "Mandi", "Palampur", "Baddi", "Nahan", "Hamirpur", "Una", "Kullu"],
            "Jammu and Kashmir": ["Srinagar", "Jammu", "Baramulla", "Anantnag", "Sopore", "KathuaUdhampur", "Punch", "Rajauri", "Kupwara"],
            "Jharkhand": ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Deoghar", "Phusro", "Hazaribagh", "Giridih", "Ramgarh", "Medininagar"],
            "Karnataka": ["Bengaluru", "Mysore", "Hubli", "Mangalore", "Belgaum", "Gulbarga", "Davanagere", "Ballari", "Vijayapura", "Shivamogga"],
            "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Alappuzha", "Kollam", "Palakkad", "Kannur", "Malappuram", "Kottayam"],
            "Madhya Pradesh": ["Bhopal", "Indore", "Gwalior", "Jabalpur", "Ujjain", "Sagar", "Dewas", "Satna", "Ratlam", "Rewa"],
            "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad", "Solapur", "Amravati", "Kolhapur", "Sangli", "Malegaon"],
            "Manipur": ["Imphal", "Thoubal", "Bishnupur", "Churachandpur", "Kakching", "Ukhrul", "Senapati", "Tamenglong", "Jiribam", "Chandel"],
            "Meghalaya": ["Shillong", "Tura", "Nongstoin", "Jowai", "Baghmara", "Williamnagar", "Nongpoh", "Resubelpara", "Khliehriat", "Ampati"],
            "Mizoram": ["Aizawl", "Lunglei", "Saiha", "Champhai", "Kolasib", "Serchhip", "Lawngtlai", "Mamit", "Bairabi", "Vairengte"],
            "Nagaland": ["Kohima", "Dimapur", "Mokokchung", "Tuensang", "Wokha", "Zunheboto", "Phek", "Kiphire", "Longleng", "Peren"],
            "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela", "Berhampur", "Sambalpur", "Puri", "Balasore", "Bhadrak", "Baripada", "Jharsuguda"],
            "Puducherry": ["Puducherry", "Karaikal", "Mahe", "Yanam"], // Added Puducherry with its cities
            "Punjab": ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "Mohali", "Firozpur", "Batala", "Pathankot", "Moga"],
            "Rajasthan": ["Jaipur", "Jodhpur", "Kota", "Bikaner", "Ajmer", "Udaipur", "Bhilwara", "Alwar", "Bharatpur", "Sikar"],
            "Sikkim": ["Gangtok", "Namchi", "Geyzing", "Mangan", "Jorethang", "Nayabazar", "Rangpo", "Singtam", "Pakyong", "Ranipool"],
            "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli", "Tiruppur", "Vellore", "Erode", "Thoothukkudi"],
            "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Khammam", "Karimnagar", "Ramagundam", "Mahabubnagar", "Nalgonda", "Adilabad", "Miryalaguda"],
            "Tripura": ["Agartala", "Dharmanagar", "Udaipur", "Kailasahar", "Belonia", "Khowai", "Teliamura", "Bishalgarh", "Ambassa", "Ranir Bazar"],
            "Uttar Pradesh": ["Lucknow", "Kanpur", "Ghaziabad", "Agra", "Meerut", "Varanasi", "Allahabad", "Bareilly", "Moradabad", "Saharanpur"],
            "Uttarakhand": ["Dehradun", "Haridwar", "Roorkee", "Haldwani", "Rudrapur", "Kashipur", "Rishikesh", "Kotdwar", "Ramnagar", "Manglaur"],
            "West Bengal": ["Kolkata", "Asansol", "Siliguri", "Durgapur", "Bardhaman", "Malda", "Baharampur", "Habra", "Kharagpur", "Shantipur"]
        }
    },
    "United States": {
        "code": "US",
        "states": {
            "Alabama": ["Birmingham", "Montgomery", "Mobile", "Huntsville", "Tuscaloosa", "Hoover", "Dothan", "Auburn", "Decatur", "Madison"],
            "Alaska": ["Anchorage", "Juneau", "Fairbanks", "Sitka", "Ketchikan", "Wasilla", "Kenai", "Kodiak", "Bethel", "Palmer"],
            "Arizona": ["Phoenix", "Tucson", "Mesa", "Chandler", "Scottsdale", "Glendale", "Gilbert", "Tempe", "Peoria", "Surprise"],
            "Arkansas": ["Little Rock", "Fort Smith", "Fayetteville", "Springdale", "Jonesboro", "North Little Rock", "Conway", "Rogers", "Pine Bluff", "Bentonville"],
            "California": ["Los Angeles", "San Diego", "San Jose", "San Francisco", "Fresno", "Sacramento", "Long Beach", "Oakland", "Bakersfield", "Anaheim"],
            "Colorado": ["Denver", "Colorado Springs", "Aurora", "Fort Collins", "Lakewood", "Thornton", "Arvada", "Westminster", "Pueblo", "Centennial"],
            "Connecticut": ["Bridgeport", "New Haven", "Hartford", "Stamford", "Waterbury", "Norwalk", "Danbury", "New Britain", "West Hartford", "Greenwich"],
            "Delaware": ["Wilmington", "Dover", "Newark", "Middletown", "Smyrna", "Milford", "Seaford", "Georgetown", "Elsmere", "New Castle"],
            "Florida": ["Jacksonville", "Miami", "Tampa", "Orlando", "St. Petersburg", "Hialeah", "Tallahassee", "Fort Lauderdale", "Port St. Lucie", "Cape Coral"],
            "Georgia": ["Atlanta", "Augusta", "Columbus", "Macon", "Savannah", "Athens", "Sandy Springs", "Roswell", "Johns Creek", "Albany"],
            "Hawaii": ["Honolulu", "Pearl City", "Hilo", "Kailua", "Waipahu", "Kaneohe", "Kailua-Kona", "Kahului", "Kapaa", "Wahiawa"],
            "Idaho": ["Boise", "Meridian", "Nampa", "Idaho Falls", "Pocatello", "Caldwell", "Coeur d'Alene", "Twin Falls", "Lewiston", "Post Falls"],
            "Illinois": ["Chicago", "Aurora", "Peoria", "Rockford", "Joliet", "Naperville", "Springfield", "Waukegan", "Cicero", "Champaign"],
            "Indiana": ["Indianapolis", "Fort Wayne", "Evansville", "South Bend", "Carmel", "Fishers", "Bloomington", "Hammond", "Gary", "Muncie"],
            "Iowa": ["Des Moines", "Cedar Rapids", "Davenport", "Sioux City", "Waterloo", "Iowa City", "Council Bluffs", "Ames", "Dubuque", "West Des Moines"],
            "Kansas": ["Wichita", "Overland Park", "Kansas City", "Topeka", "Olathe", "Lawrence", "Shawnee", "Salina", "Hutchinson", "Lenexa"],
            "Kentucky": ["Louisville", "Lexington", "Bowling Green", "Owensboro", "Covington", "Hopkinsville", "Richmond", "Florence", "Georgetown", "Henderson"],
            "Louisiana": ["New Orleans", "Baton Rouge", "Shreveport", "Lafayette", "Lake Charles", "Kenner", "Bossier City", "Monroe", "Alexandria", "Houma"],
            "Maine": ["Portland", "Lewiston", "Bangor", "South Portland", "Auburn", "Biddeford", "Sanford", "Saco", "Augusta", "Westbrook"],
            "Maryland": ["Baltimore", "Frederick", "Rockville", "Gaithersburg", "Bowie", "Hagerstown", "Annapolis", "College Park", "Salisbury", "Laurel"],
            "Massachusetts": ["Boston", "Worcester", "Springfield", "Lowell", "Cambridge", "New Bedford", "Brockton", "Quincy", "Lynn", "Fall River"],
            "Michigan": ["Detroit", "Grand Rapids", "Warren", "Sterling Heights", "Lansing", "Ann Arbor", "Flint", "Dearborn", "Livonia", "Westland"],
            "Minnesota": ["Minneapolis", "St. Paul", "Rochester", "Duluth", "Bloomington", "Brooklyn Park", "Plymouth", "St. Cloud", "Eagan", "Woodbury"],
            "Mississippi": ["Jackson", "Gulfport", "Southaven", "Hattiesburg", "Biloxi", "Meridian", "Tupelo", "Greenville", "Olive Branch", "Horn Lake"],
            "Missouri": ["Kansas City", "St. Louis", "Springfield", "Columbia", "Independence", "Lee's Summit", "O'Fallon", "St. Joseph", "St. Charles", "St. Peters"],
            "Montana": ["Billings", "Missoula", "Great Falls", "Bozeman", "Butte", "Helena", "Kalispell", "Havre", "Anaconda", "Miles City"],
            "Nebraska": ["Omaha", "Lincoln", "Bellevue", "Grand Island", "Kearney", "Fremont", "Hastings", "Norfolk", "North Platte", "Papillion"],
            "Nevada": ["Las Vegas", "Henderson", "Reno", "North Las Vegas", "Sparks", "Carson City", "Fernley", "Elko", "Mesquite", "Boulder City"],
            "New Hampshire": ["Manchester", "Nashua", "Concord", "Derry", "Dover", "Rochester", "Salem", "Merrimack", "Hudson", "Londonderry"],
            "New Jersey": ["Newark", "Jersey City", "Paterson", "Elizabeth", "Edison", "Woodbridge", "Lakewood", "Toms River", "Hamilton", "Trenton"],
            "New Mexico": ["Albuquerque", "Las Cruces", "Rio Rancho", "Santa Fe", "Roswell", "Farmington", "Clovis", "Hobbs", "Alamogordo", "Carlsbad"],
            "New York": ["New York City", "Buffalo", "Rochester", "Yonkers", "Syracuse", "Albany", "New Rochelle", "Mount Vernon", "Schenectady", "Utica"],
            "North Carolina": ["Charlotte", "Raleigh", "Greensboro", "Durham", "Winston-Salem", "Fayetteville", "Cary", "Wilmington", "High Point", "Asheville"],
            "North Dakota": ["Fargo", "Bismarck", "Grand Forks", "Minot", "West Fargo", "Williston", "Dickinson", "Mandan", "Jamestown", "Wahpeton"],
            "Ohio": ["Columbus", "Cleveland", "Cincinnati", "Toledo", "Akron", "Dayton", "Parma", "Canton", "Youngstown", "Lorain"],
            "Oklahoma": ["Oklahoma City", "Tulsa", "Norman", "Broken Arrow", "Lawton", "Edmond", "Moore", "Midwest City", "Enid", "Stillwater"],
            "Oregon": ["Portland", "Salem", "Eugene", "Gresham", "Hillsboro", "Bend", "Beaverton", "Medford", "Springfield", "Corvallis"],
            "Pennsylvania": ["Philadelphia", "Pittsburgh", "Allentown", "Erie", "Reading", "Scranton", "Bethlehem", "Lancaster", "Harrisburg", "Altoona"],
            "Rhode Island": ["Providence", "Warwick", "Cranston", "Pawtucket", "East Providence", "Woonsocket", "Newport", "Central Falls", "Westerly", "North Providence"],
            "South Carolina": ["Columbia", "Charleston", "North Charleston", "Mount Pleasant", "Rock Hill", "Greenville", "Summerville", "Sumter", "Goose Creek", "Hilton Head Island"],
            "South Dakota": ["Sioux Falls", "Rapid City", "Aberdeen", "Brookings", "Watertown", "Mitchell", "Yankton", "Pierre", "Huron", "Spearfish"],
            "Tennessee": ["Nashville", "Memphis", "Knoxville", "Chattanooga", "Clarksville", "Murfreesboro", "Franklin", "Jackson", "Johnson City", "Bartlett"],
            "Texas": ["Houston", "San Antonio", "Dallas", "Austin", "Fort Worth", "El Paso", "Arlington", "Corpus Christi", "Plano", "Laredo"],
            "Utah": ["Salt Lake City", "West Valley City", "Provo", "West Jordan", "Orem", "Sandy", "Ogden", "St. George", "Layton", "Taylorsville"],
            "Vermont": ["Burlington", "Essex", "South Burlington", "Colchester", "Rutland", "Brattleboro", "Montpelier", "Milton", "St. Albans", "Winooski"],
            "Virginia": ["Virginia Beach", "Norfolk", "Chesapeake", "Richmond", "Newport News", "Alexandria", "Hampton", "Portsmouth", "Suffolk", "Roanoke"],
            "Washington": ["Seattle", "Spokane", "Tacoma", "Vancouver", "Bellevue", "Kent", "Everett", "Renton", "Yakima", "Federal Way"],
            "West Virginia": ["Charleston", "Huntington", "Parkersburg", "Martinsburg", "Wheeling", "Morgantown", "Fairmont", "Beckley", "Clarksburg", "Lewisburg"],
            "Wisconsin": ["Milwaukee", "Madison", "Green Bay", "Kenosha", "Racine", "Appleton", "Waukesha", "Eau Claire", "Oshkosh", "Janesville"],
            "Wyoming": ["Cheyenne", "Casper", "Laramie", "Gillette", "Rock Springs", "Sheridan", "Green River", "Evanston", "Riverton", "Jackson"]
        }
    },
    "United Kingdom": {
        "code": "GB",
        "states": {
            "England": ["London", "Birmingham", "Manchester", "Liverpool", "Sheffield", "Leeds", "Bristol", "Newcastle", "Nottingham", "Leicester"],
            "Scotland": ["Edinburgh", "Glasgow", "Aberdeen", "Dundee", "Stirling", "Perth", "Inverness", "St Andrews", "Paisley", "Hamilton"],
            "Wales": ["Cardiff", "Swansea", "Newport", "Wrexham", "Barry", "Caerphilly", "Bridgend", "Neath", "Port Talbot", "Cwmbran"],
            "Northern Ireland": ["Belfast", "Derry", "Lisburn", "Newtownabbey", "Bangor", "Craigavon", "Castlereagh", "Ballymena", "Newtownards", "Carrickfergus"]
        }
    },
    "Canada": {
        "code": "CA",
        "states": {
            "Alberta": ["Calgary", "Edmonton", "Red Deer", "Lethbridge", "Medicine Hat", "Grande Prairie", "Airdrie", "Spruce Grove", "Okotoks", "Cochrane"],
            "British Columbia": ["Vancouver", "Victoria", "Surrey", "Burnaby", "Richmond", "Abbotsford", "Coquitlam", "Kelowna", "Saanich", "Delta"],
            "Manitoba": ["Winnipeg", "Brandon", "Steinbach", "Thompson", "Portage la Prairie", "Winkler", "Selkirk", "Morden", "Dauphin", "The Pas"],
            "New Brunswick": ["Saint John", "Moncton", "Fredericton", "Dieppe", "Riverview", "Miramichi", "Edmundston", "Bathurst", "Campbellton", "Sackville"],
            "Newfoundland and Labrador": ["St. John's", "Mount Pearl", "Corner Brook", "Conception Bay South", "Paradise", "Grand Falls-Windsor", "Happy Valley-Goose Bay", "Gander", "Labrador City", "Stephenville"],
            "Northwest Territories": ["Yellowknife", "Hay River", "Inuvik", "Fort Smith", "Behchoko", "Iqaluit", "Norman Wells", "Rankin Inlet", "Arviat", "Baker Lake"],
            "Nova Scotia": ["Halifax", "Sydney", "Dartmouth", "Truro", "New Glasgow", "Glace Bay", "Yarmouth", "Bridgewater", "Kentville", "Amherst"],
            "Nunavut": ["Iqaluit", "Rankin Inlet", "Arviat", "Baker Lake", "Igloolik", "Pangnirtung", "Pond Inlet", "Kuujjuaq", "Cambridge Bay", "Gjoa Haven"],
            "Ontario": ["Toronto", "Ottawa", "Mississauga", "Brampton", "Hamilton", "London", "Markham", "Vaughan", "Kitchener", "Windsor"],
            "Prince Edward Island": ["Charlottetown", "Summerside", "Stratford", "Cornwall", "Montague", "Souris", "Alberton", "Kensington", "Georgetown", "Tignish"],
            "Quebec": ["Montreal", "Quebec City", "Laval", "Gatineau", "Longueuil", "Sherbrooke", "Saguenay", "Lévis", "Trois-Rivières", "Terrebonne"],
            "Saskatchewan": ["Saskatoon", "Regina", "Prince Albert", "Moose Jaw", "Swift Current", "Yorkton", "North Battleford", "Estevan", "Weyburn", "Lloydminster"],
            "Yukon": ["Whitehorse", "Dawson City", "Watson Lake", "Haines Junction", "Mayo", "Carmacks", "Faro", "Ross River", "Teslin", "Old Crow"]
        }
    },
    "Australia": {
        "code": "AU",
        "states": {
            "New South Wales": ["Sydney", "Newcastle", "Wollongong", "Albury", "Maitland", "Wagga Wagga", "Port Macquarie", "Tamworth", "Orange", "Dubbo"],
            "Victoria": ["Melbourne", "Geelong", "Ballarat", "Bendigo", "Frankston", "Mildura", "Shepparton", "Wodonga", "Warrnambool", "Traralgon"],
            "Queensland": ["Brisbane", "Gold Coast", "Sunshine Coast", "Townsville", "Cairns", "Toowoomba", "Rockhampton", "Mackay", "Bundaberg", "Gladstone"],
            "Western Australia": ["Perth", "Fremantle", "Rockingham", "Mandurah", "Bunbury", "Kalgoorlie", "Geraldton", "Albany", "Busselton", "Ellenbrook"],
            "South Australia": ["Adelaide", "Mount Gambier", "Whyalla", "Murray Bridge", "Port Augusta", "Port Pirie", "Victor Harbor", "Gawler", "Port Lincoln", "Kadina"],
            "Tasmania": ["Hobart", "Launceston", "Devonport", "Burnie", "Ulverstone", "Kingston", "Sorell", "Wynyard", "George Town", "Smithton"],
            "Australian Capital Territory": ["Canberra", "Queanbeyan", "Gungahlin", "Tuggeranong", "Belconnen", "Weston Creek", "Woden", "Molonglo Valley", "Jerrabomberra", "Hall"],
            "Northern Territory": ["Darwin", "Alice Springs", "Palmerston", "Katherine", "Nhulunbuy", "Tennant Creek", "Jabiru", "Yulara", "Humpty Doo", "Howard Springs"]
        }
    }
};

// Pincode/ZIP validation patterns by country
const PINCODE_PATTERNS = {
    "India": {
        pattern: /^[1-9][0-9]{5}$/,
        format: "6 digits (e.g., 600004)",
        message: "Please enter a valid 6-digit Indian pincode"
    },
    "United States": {
        pattern: /^[0-9]{5}(-[0-9]{4})?$/,
        format: "5 digits or ZIP+4 (e.g., 12345 or 12345-6789)",
        message: "Please enter a valid US ZIP code"
    },
    "United Kingdom": {
        pattern: /^[A-Z]{1,2}[0-9]{1,2}[A-Z]?\s?[0-9][A-Z]{2}$/i,
        format: "UK postcode format (e.g., SW1A 1AA)",
        message: "Please enter a valid UK postcode"
    },
    "Canada": {
        pattern: /^[A-Z][0-9][A-Z]\s?[0-9][A-Z][0-9]$/i,
        format: "Canadian postal code (e.g., K1A 0B1)",
        message: "Please enter a valid Canadian postal code"
    },
    "Australia": {
        pattern: /^[0-9]{4}$/,
        format: "4 digits (e.g., 2000)",
        message: "Please enter a valid Australian postcode"
    }
};

// Indian state-wise pincode ranges for validation
const INDIAN_STATE_PINCODE_RANGES = {
    "Andhra Pradesh": { start: 500000, end: 535999 },
    "Arunachal Pradesh": { start: 790001, end: 792131 },
    "Assam": { start: 781000, end: 788931 },
    "Bihar": { start: 800001, end: 855117 },
    "Chhattisgarh": { start: 490001, end: 497778 },
    "Delhi": { start: 110001, end: 110097 },
    "Goa": { start: 403001, end: 403806 },
    "Gujarat": { start: 360001, end: 396590 },
    "Haryana": { start: 121000, end: 136156 },
    "Himachal Pradesh": { start: 171000, end: 177601 },
    "Jammu and Kashmir": { start: 180001, end: 194404 },
    "Jharkhand": { start: 813200, end: 835325 },
    "Karnataka": { start: 560001, end: 591346 },
    "Kerala": { start: 670001, end: 695615 },
    "Madhya Pradesh": { start: 450001, end: 488448 },
    "Maharashtra": { start: 400001, end: 445402 },
    "Manipur": { start: 795001, end: 795159 },
    "Meghalaya": { start: 793001, end: 794115 },
    "Mizoram": { start: 796001, end: 796901 },
    "Nagaland": { start: 797001, end: 798627 },
    "Odisha": { start: 750001, end: 770076 },
    "Puducherry": { start: 533464, end: 673310 },
    "Punjab": { start: 140100, end: 160104 },
    "Rajasthan": { start: 301001, end: 345034 },
    "Sikkim": { start: 737101, end: 737139 },
    "Tamil Nadu": { start: 600001, end: 643253 },
    "Telangana": { start: 500001, end: 509412 },
    "Tripura": { start: 799001, end: 799290 },
    "Uttar Pradesh": { start: 201000, end: 285223 },
    "Uttarakhand": { start: 244713, end: 263680 },
    "West Bengal": { start: 700001, end: 743711 }
};

export default function UserProfileSettings() {
    const [user, setUser] = useState(null);
    // Renamed formData to profileData
    const [profileData, setProfileData] = useState({
        full_name: '',
        phone: '',
        address_line_1: '',
        address_line_2: '',
        city: '',
        state: '',
        pincode: '',
        country: '',
        profile_photo_url: ''
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    // isUploadingPhoto will now be used specifically when the photo is being sent to the server during handleSave
    const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

    // New states for photo handling
    const [photoFile, setPhotoFile] = useState(null); // Stores the File object for upload
    const [shouldDeletePhoto, setShouldDeletePhoto] = useState(false); // Flag if photo should be removed on save
    const [photoPreviewUrl, setPhotoPreviewUrl] = useState(null); // URL for local preview of selected file

    // Location state
    const [availableStates, setAvailableStates] = useState([]);
    const [availableCities, setAvailableCities] = useState([]);
    const [isProfileLoaded, setIsProfileLoaded] = useState(false);
      const navigate = useNavigate();

const getCountryCode = (country) => {
  const entry = COUNTRIES_DATA[country];
  return entry?.code || '';
};





useEffect(() => {
  const fetchUser = () => {
    try {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        toast.error("User not logged in");
        setIsLoading(false);
        return;
      }

      const userObj = JSON.parse(storedUser);
      setUser(userObj);
console.log("Loaded user from localStorage:", userObj.profile_photo_url);

      const country = userObj.country || "";
      const state = userObj.state || userObj.State || "";
      const city = userObj.city || "";

      // 🔹 Set states list
      if (country && COUNTRIES_DATA[country]) {
        const statesList = Object.keys(COUNTRIES_DATA[country].states);
        setAvailableStates(statesList);

        // 🔹 Set cities list
        if (state && COUNTRIES_DATA[country].states[state]) {
          setAvailableCities(COUNTRIES_DATA[country].states[state]);
        }
      }

      setProfileData({
        full_name: userObj.name || "",
        phone: userObj.mobile || "",
        address_line_1: userObj.address1 || "",
        address_line_2: userObj.address2 || "",
        city,
        state,
        pincode: userObj.zipcode || "",
        country,
        profile_photo_url: userObj.profile_photo_url || "",
      });

      setIsProfileLoaded(true);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  };

  fetchUser();
}, []);



    // Effect for handling photo preview URL cleanup
    useEffect(() => {
        if (photoPreviewUrl) {
            return () => URL.revokeObjectURL(photoPreviewUrl);
        }
    }, [photoPreviewUrl]);

    const handleChange = (e) => {
        setProfileData({ ...profileData, [e.target.id]: e.target.value });
    };

    // 🔹 Auto-save profile data as draft (local)
    // useEffect(() => {
    //     if (!isLoading && isProfileLoaded) {
    //         localStorage.setItem(
    //             'user_profile_draft',
    //             JSON.stringify(profileData)
    //         );
    //     }
    // }, [profileData, isLoading, isProfileLoaded]);



    const handleCountryChange = (country) => {
        setProfileData({ ...profileData, country, state: '', city: '', pincode: '' }); // Clear pincode on country change
        if (COUNTRIES_DATA[country]) {
            setAvailableStates(Object.keys(COUNTRIES_DATA[country].states));
            setAvailableCities([]);
        } else {
            setAvailableStates([]);
            setAvailableCities([]);
        }
    };

    const handleStateChange = (state) => {
        setProfileData({ ...profileData, state, city: '', pincode: '' }); // Clear pincode on state change
        if (profileData.country && COUNTRIES_DATA[profileData.country] && COUNTRIES_DATA[profileData.country].states[state]) {
            setAvailableCities(COUNTRIES_DATA[profileData.country].states[state]);
        } else {
            setAvailableCities([]);
        }
    };

    const handleCityChange = (city) => {
        setProfileData({ ...profileData, city });
    };

    const handlePhotoUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file type
        if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
            toast.error("Please upload a valid image file (.jpg, .jpeg, or .png)");
            // Clear previous selections if invalid file is chosen
            setPhotoFile(null);
            setPhotoPreviewUrl(null);
            return;
        }

        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image size must be less than 5MB");
            // Clear previous selections if invalid file is chosen
            setPhotoFile(null);
            setPhotoPreviewUrl(null);
            return;
        }

        setPhotoFile(file);
        setShouldDeletePhoto(false); // If a new photo is uploaded, don't delete
        setPhotoPreviewUrl(URL.createObjectURL(file)); // Create URL for immediate preview
        toast.success("Photo selected for upload. Click 'Save Changes' to apply.");
    };

    const handleDeletePhoto = () => {
        setShouldDeletePhoto(true); // Mark for deletion on save
        setPhotoFile(null); // Clear any newly selected file
        setPhotoPreviewUrl(null); // Clear preview
        toast.success("Photo marked for removal. Click 'Save Changes' to apply.");
    };

    const validatePincode = (pincode, country, state) => {
        if (!pincode || !country) {
            return { isValid: false, message: "Pincode and country are required." };
        }

        // Get the pattern for the selected country
        const pincodeConfig = PINCODE_PATTERNS[country];
        if (!pincodeConfig) {
            // For countries not in our list, do basic alphanumeric check
            const basicPattern = /^[a-zA-Z0-9\s-]{3,10}$/;
            if (!basicPattern.test(pincode)) {
                return { isValid: false, message: "Please enter a valid postal code (3-10 characters, alphanumeric, spaces, and hyphens allowed)." };
            }
            return { isValid: true };
        }

        // Validate format
        if (!pincodeConfig.pattern.test(pincode)) {
            return { isValid: false, message: pincodeConfig.message };
        }

        // Additional validation for India - check if pincode matches state
        if (country === "India" && state && INDIAN_STATE_PINCODE_RANGES[state]) {
            const pincodeNum = parseInt(pincode, 10);
            const range = INDIAN_STATE_PINCODE_RANGES[state];

            if (pincodeNum < range.start || pincodeNum > range.end) {
                return {
                    isValid: false,
                    message: `This pincode (${pincode}) does not seem to belong to ${state}. Please verify your pincode.`
                };
            }
        }

        return { isValid: true };
    };

    const validateForm = () => {
        // Basic validation for required fields
        const requiredFields = ['full_name', 'phone', 'address_line_1', 'country', 'state', 'city', 'pincode'];
        for (const field of requiredFields) {
            if (!profileData[field]) {
                toast.error(`Please fill in the '${field.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())}' field.`);
                return false;
            }
        }

        // Phone number validation (basic, 7-15 digits for international, ignoring spaces/hyphens/parentheses)
        const phoneRegex = /^\+?[0-9]{7,15}$/;
        if (profileData.phone && !phoneRegex.test(profileData.phone.replace(/[\s\-\(\)]/g, ''))) {
            toast.error("Please enter a valid phone number (7-15 digits, optional leading '+', spaces/hyphens will be ignored).");
            return false;
        }

        // Enhanced pincode validation
        const pincodeValidation = validatePincode(profileData.pincode, profileData.country, profileData.state);
        if (!pincodeValidation.isValid) {
            toast.error(pincodeValidation.message);
            return false;
        }

        return true;
    };

    // Renamed handleSubmit to handleSave as per outline
const handleSave = async (e) => {
  e.preventDefault();

  if (!validateForm()) return;

  setIsSaving(true);
  setSaveSuccess(false);

  try {
    let finalPhotoUrl = profileData.profile_photo_url;

    /* ---------------- PHOTO UPLOAD (OPTIONAL) ---------------- */
    if (photoFile) {
      setIsUploadingPhoto(true);

   const formData = new FormData();
formData.append("photo", photoFile);
formData.append("upload_type", "profile_photo");
formData.append("user_id", user.id);


      const uploadRes = await fetch(
        "https://secure.madhatv.in/api/v2/profileupdate.php",
        {
          method: "POST",
          body: formData,
        }
      );

      const uploadResult = await uploadRes.json();

      if (uploadResult?.error) {
        throw new Error(uploadResult.message || "Photo upload failed");
      }

      finalPhotoUrl = uploadResult.file_url;
      console.log("Uploaded photo URL:", finalPhotoUrl);
      setIsUploadingPhoto(false);
    }

    if (shouldDeletePhoto) {
      finalPhotoUrl = "";
    }

    /* ---------------- PROFILE UPDATE API ---------------- */
    const apiPayload = {
      id: user.id,
      name: profileData.full_name,
      email: user.email,
      country_code: getCountryCode(profileData.country),
      mobile: profileData.phone,
      address1: profileData.address_line_1,
      address2: profileData.address_line_2,
      city: profileData.city,
      state: profileData.state,
      country: profileData.country,
      zipcode: profileData.pincode,
      profile_photo_url: finalPhotoUrl,
    };

    const response = await fetch(
      "https://secure.madhatv.in/api/v2/profileupdate.php",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apiPayload),
      }
    );

    const result = await response.json();
    console.log("PROFILE UPDATE API RESPONSE:", result);

    if (result?.error) {
      throw new Error(result.message || "Profile update failed");
    }
    console.log("✅ Database updated successfully for user ID:", user.id);

    /* ---------------- 🔥 LOCAL + REFRESH SAFE UPDATE ---------------- */
    const updatedUser = {
      ...user,
      name: profileData.full_name,
      email:profileData.email_id,
      mobile: profileData.phone,
      address1: profileData.address_line_1,
      address2: profileData.address_line_2,
      city: profileData.city,
      state: profileData.state,
      country: profileData.country,
      zipcode: profileData.pincode,
      profile_photo_url: finalPhotoUrl,
    };

    // 🔥 localStorage update (REFRESH FIX)
   localStorage.setItem(
  "user",
  JSON.stringify({
    ...updatedUser,
    profile_photo_url: finalPhotoUrl || "",
  })
);


    // 🔥 React state update (UI FIX)
    setUser(updatedUser);

    setProfileData(prev => ({
      ...prev,
      profile_photo_url: finalPhotoUrl,
    }));

    setPhotoFile(null);
    setShouldDeletePhoto(false);
    setPhotoPreviewUrl(null);

    setSaveSuccess(true);
    toast.success("Profile updated successfully!");
    setTimeout(() => setSaveSuccess(false), 3000);

  } catch (error) {
    console.error("Profile update error:", error);
    toast.error(error.message || "Failed to update profile");
  } finally {
    setIsSaving(false);
  }
};


    const getInitials = (name) => {
        if (!name) return 'U';
        const parts = name.split(' ');
        if (parts.length > 1) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return name[0].toUpperCase();
    };

    // Get pincode format hint based on selected country
    const getPincodeFormatHint = () => {
        if (!profileData.country) return "Enter postal/ZIP code";
        const config = PINCODE_PATTERNS[profileData.country];
        return config ? config.format : "Enter postal/ZIP code";
    };

    // Determine the photo to display:
    // 1. If a new photo is selected (photoFile), show its preview.
    // 2. Else if an existing photo URL is present AND it's not marked for deletion, show the existing URL.
    // 3. Otherwise, show nothing (fallback will be initials).
    const currentPhotoDisplayUrl = photoPreviewUrl || (shouldDeletePhoto ? null : profileData.profile_photo_url);

    if (isLoading || !isProfileLoaded) {
        return (
            <UserDashboardLayout>
                <div className="flex justify-center items-center h-full">
                    <Loader2 className="animate-spin h-12 w-12 text-red-600" />
                </div>
            </UserDashboardLayout>
        );
    }

    const ProfileChangePswd=()=>{
     navigate("/ProfilePasswordChange");
    }

    return (
        <UserDashboardLayout>
            <div className="p-6 md:p-8">
                <h1 className="text-3xl font-bold text-slate-900 mb-6">Profile Settings</h1>
                     <Button className="mb-6" onClick={ProfileChangePswd}>Change Password</Button>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Profile Photo Section */}
                    <Card>

                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Camera className="w-5 h-5" />
                                Profile Photo
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex flex-col items-center space-y-4">
                                <Avatar className="w-32 h-32">
                                    <AvatarImage src={currentPhotoDisplayUrl || undefined} alt="Profile" />
                                    <AvatarFallback className="bg-gradient-to-br from-red-500 to-red-600 text-white text-2xl font-bold">
                                        {getInitials(profileData.full_name)}
                                    </AvatarFallback>
                                </Avatar>

                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => document.getElementById('photo-upload').click()}
                                        // Button disabled if saving (which includes uploading photo during save)
                                        disabled={isSaving}
                                    >
                                        {(isSaving && isUploadingPhoto) ? ( // Only show loader if currently uploading photo during save
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        ) : (
                                            <Upload className="w-4 h-4 mr-2" />
                                        )}
                                        {profileData.profile_photo_url && !shouldDeletePhoto || photoFile
                                            ? 'Change Photo'
                                            : 'Upload Photo'}
                                    </Button>

                                    {(profileData.profile_photo_url && !shouldDeletePhoto) || photoFile ? (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleDeletePhoto}
                                            className="text-red-600 hover:text-red-700"
                                            disabled={isSaving} // Disable if saving
                                        >
                                            <X className="w-4 h-4 mr-2" />
                                            Remove
                                        </Button>
                                    ) : null}
                                </div>

                                <input
                                    id="photo-upload"
                                    type="file"
                                    accept="image/jpeg,image/jpg,image/png"
                                    onChange={handlePhotoUpload}
                                    className="hidden"
                                />

                                <p className="text-sm text-slate-500 text-center">
                                    Upload a photo to personalize your profile<br />
                                    Supported formats: JPG, PNG (Max 5MB)
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Personal Information */}

                    <Card>
                        <CardHeader>
                            <CardTitle>Personal Information</CardTitle>
                        </CardHeader>
                        {/* Form onSubmit calls handleSave */}
                        <form onSubmit={handleSave}>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="full_name">Full Name</Label>
                                        <Input id="full_name" value={profileData.full_name} onChange={handleChange} />
                                    </div>
                                    <div>
                                        <Label htmlFor="phone">Phone Number</Label>
                                        <Input id="phone" value={profileData.phone} onChange={handleChange} />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="address_line_1">Address Line 1</Label>
                                    <Input id="address_line_1" value={profileData.address_line_1} onChange={handleChange} />
                                </div>

                                <div>
                                    <Label htmlFor="address_line_2">Address Line 2</Label>


                                    <Input
                                        id="address_line_2"
                                        value={profileData.address_line_2}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="email">Email (Username)</Label>
                                    <Input
                                        id="email"
                                        value={user?.email_id || ''}
                                        disabled
                                        className="bg-slate-100 cursor-not-allowed"
                                    />
                                </div>



                                {/* Location Dropdowns */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <Label htmlFor="country">Country</Label>
                                        <Select value={profileData.country} onValueChange={handleCountryChange}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Country" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.keys(COUNTRIES_DATA).map(country => (
                                                    <SelectItem key={country} value={country}>{country}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="state">State/Province</Label>
                                        <Select value={profileData.state} onValueChange={handleStateChange} disabled={!profileData.country}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select State" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableStates.map(state => (
                                                    <SelectItem key={state} value={state}>{state}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="city">City</Label>
                                        <Input
                                            id="city"
                                            value={profileData.city}
                                            onChange={handleChange}
                                            placeholder="Enter city name"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="pincode">Pincode / Postal Code</Label>
                                    <Input
                                        id="pincode"
                                        value={profileData.pincode}
                                        onChange={handleChange}
                                        placeholder={getPincodeFormatHint()}
                                    />
                                    <p className="text-xs text-slate-500 mt-1">
                                        {getPincodeFormatHint()}
                                    </p>
                                </div>



                            </CardContent>
                            <CardFooter className="flex justify-end gap-4">
                                {saveSuccess && (
                                    <div className="flex items-center gap-2 text-green-600">
                                        <CheckCircle className="w-5 h-5" />
                                        <span>Profile saved!</span>
                                    </div>
                                )}
                                {/* Button disabled if saving (includes photo upload during save) */}
                                <Button type="submit" disabled={isSaving}>
                                    {isSaving ? (
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                        <Save className="w-4 h-4 mr-2" />
                                    )}
                                    Save Changes
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </div>
            </div>
        </UserDashboardLayout>
    );
}