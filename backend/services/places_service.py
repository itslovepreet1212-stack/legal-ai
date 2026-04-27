"""OpenStreetMap/Nominatim service for finding nearby lawyers."""
import time
import requests


def get_specialty_mapping():
    """Return a mapping of document types to lawyer specialties for OSM search.

    Maps common legal document types to appropriate lawyer specializations
    for more relevant search results.

    Returns:
        dict: Mapping of document type keywords to lawyer specialty strings.
    """
    return {
        'rental': 'advocate real estate',
        'lease': 'advocate real estate',
        'property': 'advocate property',
        'nda': 'advocate corporate',
        'non-disclosure': 'advocate corporate',
        'employment': 'advocate labour law',
        'contractor': 'advocate labour',
        'service': 'advocate business',
        'partnership': 'advocate business',
        'incorporation': 'advocate corporate',
        'divorce': 'advocate family law',
        'custody': 'advocate family law',
        'will': 'advocate estate planning',
        'trust': 'advocate estate planning',
        'immigration': 'advocate immigration',
        'criminal': 'advocate criminal law',
        'personal injury': 'advocate personal injury',
        'bankruptcy': 'advocate bankruptcy',
        'intellectual property': 'advocate intellectual property',
        'patent': 'advocate intellectual property',
        'trademark': 'advocate trademark',
        'merger': 'advocate mergers acquisitions',
        'acquisition': 'advocate corporate',
    }


def determine_lawyer_specialty(document_type):
    """Determine the appropriate lawyer specialty based on document type.

    Searches through the document type string for keywords that match
    known legal specialties.

    Args:
        document_type: String describing the type of legal document.

    Returns:
        str: The lawyer specialty search term to use.
    """
    doc_lower = document_type.lower()
    specialty_map = get_specialty_mapping()

    for keyword, specialty in specialty_map.items():
        if keyword in doc_lower:
            return specialty

    return 'advocate lawyer'


def get_nearby_lawyers(document_type, latitude, longitude):
    """Find nearby lawyers using OpenStreetMap/Nominatim API.

    Uses the Nominatim API to find lawyers matching
    the document type specialty near the given coordinates.

    Args:
        document_type: Type of legal document to determine appropriate specialty.
        latitude: Latitude of the search center point.
        longitude: Longitude of the search center point.

    Returns:
        list: List of lawyer objects with name, address, phone, rating,
              location (lat/lng), and google_maps_url.
    """
    specialty = determine_lawyer_specialty(document_type)

    search_query = f'{specialty} lawyer'

    url = 'https://nominatim.openstreetmap.org/search'
    params = {
        'q': search_query,
        'lat': latitude,
        'lon': longitude,
        'format': 'json',
        'limit': 10,
        'addressdetails': 1
    }
    headers = {
        'User-Agent': 'LegalAI-Nyayasaathi/1.0 (College Project)'
    }

    try:
        time.sleep(1)
        response = requests.get(url, params=params, headers=headers, timeout=10)
        data = response.json()

        if not data or len(data) == 0:
            fallback_query = f'advocate lawyer'
            params['q'] = fallback_query
            response = requests.get(url, params=params, headers=headers, timeout=10)
            data = response.json()

        lawyers = []
        for place in data[:10]:
            lawyers.append({
                'name': place.get('display_name', 'Unknown Advocate').split(',')[0],
                'address': place.get('display_name', 'Address not available'),
                'phone': place.get('phone', 'Phone not available'),
                'rating': 0,
                'location': {
                    'lat': float(place.get('lat', 0)),
                    'lng': float(place.get('lon', 0))
                },
                'google_maps_url': f"https://www.openstreetmap.org/?mlat={place.get('lat')}&mlon={place.get('lon')}#map=16/{place.get('lat')}/{place.get('lon')}",
                'place_id': place.get('place_id', '')
            })

        return lawyers

    except Exception as e:
        print(f'Error fetching lawyers: {e}')
        return []