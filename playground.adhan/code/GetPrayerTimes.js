function getPrayerTimes (date, method, school, prayerName, latitudeAdjustmentMethod,resolvedAddress,$vivContext) {

  if (resolvedAddress.adress != null) {
        var url = buildUrl (resolvedAddress, date, method, school, latitudeAdjustmentMethod)
  } else {
        var url = buildUrlByLatLang (resolvedAddress, date, method, school, latitudeAdjustmentMethod)
  }

  var options = {format:'json',cacheTime:15,passAsJson:false}

  var response = http.getUrl (url, options)

  var prayerTimes = iteratePrayerStructure (response.data.timings, prayerName, $vivContext.timezone)

  prayerTimes["schoolName"] = school;
  prayerTimes["methodName"] = method;
  prayerTimes["resolvedAddress"] = resolvedAddress
  prayerTimes["date"] = date
  prayerTimes["latitudeAdjustmentMethod"] = latitudeAdjustmentMethod

  return prayerTimes
}

function schoolMapping (schoolName) {
  switch (schoolName.toString()) {
    case 'Shafi': return 0;
    case 'Hanafi': return 1;
    default: return 0;
  }
}

function methodMapping (methodName) {
  switch (methodName.toString()) {
    case "Shia Ithna-Ashari, Leva Institute, Qum": return "0";
    case "University of Islamic Sciences, Karachi": return "1";
    case 'Islamic Society of North America (ISNA)': return "2";
    case 'Muslim World League': return "3";
    case 'Umm Al-Qura University, Makkah' : return 4;
    case 'Egyptian General Authority of Survey' : return 5;
    case 'Institute of Geophysics, University of Tehran' : return 6;
    case 'Gulf Region': return 7;
    case 'Kuwait': return 8;
    case 'Qatar': return 9;
    case 'Majlis Ugama Islam Singapura, Singapore': return 10;
    case 'Union Organization islamic de France': return 11;
    case 'Diyanet İşleri Başkanlığı, Turkey': return 12
    case 'Custom' : return 13;
    default: return 3;
  }
}

function buildUrlByLatLang (resolvedAddress, date, method, schoolName, latitudeAdjustmentMethod)
{

  var url = "http://api.aladhan.com/v1/timings/" + date.day +"-" + date.month + "-" + date.year + "?latitude=" + encodeURIComponent(resolvedAddress.point.latitude) + "&longitude=" + encodeURIComponent(resolvedAddress.point.longitude)
  
  if (method) {
    url = url + "&method=" + methodMapping(method)
  }

  if (schoolName) {
    url = url + "&school=" + schoolMapping(schoolName)
  }

  if (latitudeAdjustmentMethod) {
    url = url + "&latitudeAdjustmentMethod=" + latitudeAdjustmentMethod
  }

  return url
}

function buildUrl (resolvedAddress, date, method, schoolName, latitudeAdjustmentMethod)
{

  var url = "http://api.aladhan.com/v1/timingsByCity/" + date.day +"-" + date.month + "-" + date.year + "?city=" + encodeURIComponent(resolvedAddress.address.locality) + "&country=" + encodeURIComponent(resolvedAddress.address.country.countryCode3)

  if (method) {
    url = url + "&method=" + methodMapping(method)
  }

  if (schoolName) {
    url = url + "&school=" + schoolMapping(schoolName)
  }

  if (latitudeAdjustmentMethod) {
    url = url + "&latitudeAdjustmentMethod=" + latitudeAdjustmentMethod
  }

  return url
}

function parsePrayerTime (prayerTime, timezone) {
  var zonedDateTime = dates.ZonedDateTime.parseTime (prayerTime, "HH:mm", timezone )
  return {hour:zonedDateTime.getHour(), minute:zonedDateTime.getMinute(), second:0 ,timezone:timezone}
}

function iteratePrayerStructure (obj, prayerName,timezone) {
  var i = 0
  var response = new Array ()

  for (var key in obj) {
    if ((prayerName) && (key == prayerName)) {
      if (obj.hasOwnProperty(key)) {
        response[0] = {}
        response[0].prayerName = key
        response[0].prayerTime =  parsePrayerTime(obj[key],timezone)
      }
    }
    if (!prayerName) {
      if (obj.hasOwnProperty(key)) {
        response[i] = {}
        response[i].prayerName = key
        response[i].prayerTime =  parsePrayerTime(obj[key],timezone)
        i++
      }
    }
  }
  return {prayers:response}
}

module.exports = {
  function: getPrayerTimes
}
