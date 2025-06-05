import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Dimensions,
  Platform,
  Keyboard,
  ScrollView,
  PermissionsAndroid,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region, Callout } from 'react-native-maps';
import Geocoder from 'react-native-geocoding';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Card } from '../../components/Card';
import * as Location from 'expo-location';
// Remove NetInfo import to resolve bundling error

// Simple network connectivity helper (replacement for NetInfo)
const checkNetworkConnectivity = async (): Promise<boolean> => {
  try {
    // A simple fetch request to check connectivity
    // We use a timeout to avoid hanging if network is very slow
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch('https://www.google.com', { 
      method: 'HEAD',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.log('Network connectivity check failed:', error);
    return false;
  }
};

// Define custom MapEvent interface since it's not exported from react-native-maps
interface MapEvent {
  nativeEvent: {
    coordinate: {
      latitude: number;
      longitude: number;
    };
    position?: {
      x: number;
      y: number;
    };
  };
}

// Initialize Geocoder with your Google Maps API key
// For production, you would store this in a secure configuration
Geocoder.init("YOUR_GOOGLE_MAPS_API_KEY");

// Default Lisbon coordinates
const LISBON_COORDINATES = {
  latitude: 38.7223,
  longitude: -9.1393,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

// Location types
interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

interface LocationData extends LocationCoordinates {
  address: string;
  name?: string;
  description?: string;
}

interface CustomMarker extends LocationData {
  id: string;
  color?: string;
}

const MapScreen: React.FC = () => {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const mapRef = useRef<MapView | null>(null);
  
  // State variables
  const [region, setRegion] = useState<Region>(LISBON_COORDINATES);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [locationPermissionGranted, setLocationPermissionGranted] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<LocationCoordinates | null>(null);
  const [isConnected, setIsConnected] = useState<boolean | null>(true);
  const [customMarkers, setCustomMarkers] = useState<CustomMarker[]>([]);
  const [selectedMarker, setSelectedMarker] = useState<CustomMarker | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showSearchHistory, setShowSearchHistory] = useState(false);
  
  // Check network connectivity with a periodic check
  useEffect(() => {
    // Periodically check network connectivity
    const checkConnectivity = async () => {
      try {
        const isConnected = await checkNetworkConnectivity();
        setIsConnected(isConnected);
        
        // Update error message based on connectivity
        if (!isConnected && !errorMessage) {
          setErrorMessage(t('map.noNetworkConnection') || 'No network connection. Some features may be limited.');
        } else if (isConnected && errorMessage === 'No network connection. Some features may be limited.') {
          setErrorMessage(null);
        }
      } catch (error) {
        console.error('Error checking connectivity:', error);
        // Don't update error state on check failure
      }
    };
    
    // Initial check
    checkConnectivity();
    
    // Set up interval for periodic checks
    const intervalId = setInterval(checkConnectivity, 10000); // Check every 10 seconds
    
    return () => {
      clearInterval(intervalId);
    };
  }, [errorMessage, t]);

  // Request location permissions on component mount
  useEffect(() => {
    const requestLocationPermission = async () => {
      try {
        setIsLoading(true);
        
        if (Platform.OS === 'android') {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
              title: t('map.locationPermissionTitle') || "Location Permission",
              message: t('map.locationPermissionMessage') || "This app needs access to your location to show it on the map.",
              buttonNeutral: t('map.askMeLater') || "Ask Me Later",
              buttonNegative: t('map.cancel') || "Cancel",
              buttonPositive: t('map.ok') || "OK"
            }
          );
          
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            setLocationPermissionGranted(true);
            await getCurrentLocation();
          } else {
            setLocationPermissionGranted(false);
            setErrorMessage(t('map.locationPermissionDenied') || 'Location permission denied. Some features will be limited.');
          }
        } else {
          // For iOS
          const { status } = await Location.requestForegroundPermissionsAsync();
          
          if (status === 'granted') {
            setLocationPermissionGranted(true);
            await getCurrentLocation();
          } else {
            setLocationPermissionGranted(false);
            setErrorMessage(t('map.locationPermissionDenied') || 'Location permission denied. Some features will be limited.');
          }
        }
      } catch (err) {
        console.error('Error requesting location permission:', err);
        setErrorMessage(t('map.locationError') || 'Error accessing location services.');
      } finally {
        setIsLoading(false);
      }
    };

    requestLocationPermission();
  }, [t]);

  // Get current location
  const getCurrentLocation = async () => {
    try {
      setIsLoading(true);
      
      // Check for network connectivity using our helper function
      const isConnected = await checkNetworkConnectivity();
      if (!isConnected) {
        throw new Error('No network connection');
      }
      
      // Get current position
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
      });
      
      const { latitude, longitude } = location.coords;
      
      // Update current location state
      setCurrentLocation({
        latitude,
        longitude
      });
      
      // Animate map to current location
      animateToRegion({
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01
      });
      
      // Reverse geocode to get address
      try {
        const address = await reverseGeocode(latitude, longitude);
        
        // Add current location to custom markers
        const newMarker: CustomMarker = {
          id: 'current-location',
          latitude,
          longitude,
          address,
          name: t('map.currentLocation') || 'Current Location',
          color: colors.blue[600]
        };
        
        setCustomMarkers(prevMarkers => {
          // Replace current location marker if it exists
          const filteredMarkers = prevMarkers.filter(marker => marker.id !== 'current-location');
          return [...filteredMarkers, newMarker];
        });
      } catch (geocodeError) {
        console.error('Error reverse geocoding:', geocodeError);
        // Still add marker even without address
        const newMarker: CustomMarker = {
          id: 'current-location',
          latitude,
          longitude,
          address: t('map.addressUnavailable') || 'Address unavailable',
          name: t('map.currentLocation') || 'Current Location',
          color: colors.blue[600]
        };
        
        setCustomMarkers(prevMarkers => {
          const filteredMarkers = prevMarkers.filter(marker => marker.id !== 'current-location');
          return [...filteredMarkers, newMarker];
        });
      }
      
      setErrorMessage(null);
    } catch (err: any) {
      console.error('Error getting current location:', err);
      if (err?.message === 'No network connection') {
        setErrorMessage(t('map.noNetworkConnection') || 'No network connection. Unable to fetch your location.');
      } else {
        setErrorMessage(t('map.locationError') || 'Error accessing your location.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle geocoding (address to coordinates)
  const geocodeAddress = async (address: string) => {
    if (!address.trim()) {
      return;
    }
    
    try {
      setIsGeocoding(true);
      
      // Check for network connectivity using our helper function
      const isConnected = await checkNetworkConnectivity();
      if (!isConnected) {
        throw new Error('No network connection');
      }
      
      const response = await Geocoder.from(address);
      
      // Handle no results
      if (!response.results || response.results.length === 0) {
        setErrorMessage(t('map.noResultsFound') || 'No results found for this address');
        return;
      }
      
      // Get coordinates from first result
      const { lat, lng } = response.results[0].geometry.location;
      const formattedAddress = response.results[0].formatted_address;
      
      // Add to search history
      addToSearchHistory(address);
      
      // Animate map to new location
      animateToRegion({
        latitude: lat,
        longitude: lng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01
      });
      
      // Create new marker
      const newMarker: CustomMarker = {
        id: `search-${Date.now()}`,
        latitude: lat,
        longitude: lng,
        address: formattedAddress,
        name: address,
        color: colors.primary
      };
      
      setCustomMarkers(prevMarkers => [...prevMarkers, newMarker]);
      setSelectedMarker(newMarker);
      setErrorMessage(null);
      
      // Clear search input
      setSearchQuery('');
      Keyboard.dismiss();
    } catch (err: any) {
      console.error('Geocoding error:', err);
      if (err?.message === 'No network connection') {
        setErrorMessage(t('map.noNetworkConnection') || 'No network connection. Unable to search for locations.');
      } else {
        setErrorMessage(t('map.geocodingError') || 'Error searching for this address. Please try again.');
      }
    } finally {
      setIsGeocoding(false);
      setShowSearchHistory(false);
    }
  };

  // Handle reverse geocoding (coordinates to address)
  const reverseGeocode = async (latitude: number, longitude: number): Promise<string> => {
    try {
      // Check for network connectivity using our helper function
      const isConnected = await checkNetworkConnectivity();
      if (!isConnected) {
        throw new Error('No network connection');
      }
      
      const response = await Geocoder.from(latitude, longitude);
      
      if (!response.results || response.results.length === 0) {
        return t('map.addressUnavailable') || 'Address unavailable';
      }
      
      return response.results[0].formatted_address;
    } catch (err) {
      console.error('Reverse geocoding error:', err);
      throw err;
    }
  };

  // Handle map press - add new marker
  const handleMapPress = async (event: MapEvent) => {
    try {
      const { coordinate } = event.nativeEvent;
      
      // Try to get address from coordinates
      let address = t('map.addressUnavailable') || 'Address unavailable';
      try {
        address = await reverseGeocode(coordinate.latitude, coordinate.longitude);
      } catch (error) {
        console.error('Error reverse geocoding on map press:', error);
      }
      
      // Create new marker
      const newMarker: CustomMarker = {
        id: `tap-${Date.now()}`,
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
        address,
        name: t('map.droppedPin') || 'Dropped Pin',
        color: colors.blue[500] // Using blue instead of green since green isn't in the theme
      };
      
      setCustomMarkers(prevMarkers => [...prevMarkers, newMarker]);
      setSelectedMarker(newMarker);
    } catch (err) {
      console.error('Error handling map press:', err);
    }
  };

  // Animate to region smoothly
  const animateToRegion = (newRegion: Region) => {
    if (mapRef.current) {
      mapRef.current.animateToRegion(newRegion, 1000);
    }
    setRegion(newRegion);
  };

  // Add to search history
  const addToSearchHistory = (query: string) => {
    setSearchHistory(prevHistory => {
      // Remove duplicates and add new query to beginning
      const newHistory = prevHistory.filter(item => item !== query);
      // Limit history to 5 items
      return [query, ...newHistory].slice(0, 5);
    });
  };

  // Delete marker
  const deleteMarker = (id: string) => {
    Alert.alert(
      t('map.deleteMarkerTitle') || 'Delete Marker',
      t('map.deleteMarkerMessage') || 'Are you sure you want to delete this marker?',
      [
        {
          text: t('map.cancel') || 'Cancel',
          style: 'cancel',
        },
        {
          text: t('map.delete') || 'Delete',
          onPress: () => {
            setCustomMarkers(prevMarkers => prevMarkers.filter(marker => marker.id !== id));
            if (selectedMarker && selectedMarker.id === id) {
              setSelectedMarker(null);
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Error message banner */}
      {errorMessage && (
        <View style={[styles.errorBanner, { backgroundColor: colors.error + '15' }]}>
          <Ionicons name="alert-circle-outline" size={20} color={colors.error} />
          <Text style={[styles.errorText, { color: colors.error }]}>{errorMessage}</Text>
          <TouchableOpacity
            onPress={() => setErrorMessage(null)}
            style={styles.errorCloseButton}
          >
            <Ionicons name="close" size={20} color={colors.error} />
          </TouchableOpacity>
        </View>
      )}
      
      {/* Search bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
        <View style={[styles.searchBar, { backgroundColor: colors.background }]}>
          <Ionicons name="search" size={20} color={colors.text + '80'} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder={t('map.searchPlaceholder') || "Search for an address..."}
            placeholderTextColor={colors.text + '60'}
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              if (text.length > 0) {
                setShowSearchHistory(true);
              } else {
                setShowSearchHistory(false);
              }
            }}
            onSubmitEditing={() => geocodeAddress(searchQuery)}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity 
              onPress={() => {
                setSearchQuery('');
                setShowSearchHistory(false);
              }}
              style={styles.clearButton}
            >
              <Ionicons name="close-circle" size={20} color={colors.text + '60'} />
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity
          style={[styles.searchButton, { backgroundColor: colors.blue[600] }]}
          onPress={() => geocodeAddress(searchQuery)}
          disabled={isGeocoding || searchQuery.trim().length === 0}
        >
          {isGeocoding ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Ionicons name="search" size={22} color="white" />
          )}
        </TouchableOpacity>
      </View>
      
      {/* Search history dropdown */}
      {showSearchHistory && searchHistory.length > 0 && (
        <ScrollView 
          style={[styles.searchHistoryContainer, { backgroundColor: colors.card }]}
          keyboardShouldPersistTaps="handled"
        >
          {searchHistory
            .filter(item => item.toLowerCase().includes(searchQuery.toLowerCase()))
            .map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.historyItem, index < searchHistory.length - 1 && styles.historyItemBorder]}
                onPress={() => {
                  setSearchQuery(item);
                  geocodeAddress(item);
                }}
              >
                <Ionicons name="time-outline" size={16} color={colors.text + '60'} />
                <Text style={[styles.historyText, { color: colors.text }]} numberOfLines={1}>
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
        </ScrollView>
      )}
      
      {/* Map */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          region={region}
          onRegionChangeComplete={setRegion}
          onPress={handleMapPress}
          showsUserLocation={locationPermissionGranted}
          showsMyLocationButton={false}
          showsCompass={true}
          showsScale={true}
          // showsTraffic prop is not supported, removing it
          showsIndoors={true}
          zoomEnabled={true}
          rotateEnabled={true}
          scrollEnabled={true}
          pitchEnabled={true}
        >
          {/* Custom markers */}
          {customMarkers.map((marker) => (
            <Marker
              key={marker.id}
              coordinate={{
                latitude: marker.latitude,
                longitude: marker.longitude,
              }}
              title={marker.name}
              description={marker.address}
              pinColor={marker.color}
              onPress={() => setSelectedMarker(marker)}
            >
              <Callout tooltip>
                <View style={[styles.calloutContainer, { backgroundColor: colors.card }]}>
                  <Text style={[styles.calloutTitle, { color: colors.text }]}>
                    {marker.name}
                  </Text>
                  <Text style={[styles.calloutAddress, { color: colors.text + '80' }]}>
                    {marker.address}
                  </Text>
                </View>
              </Callout>
            </Marker>
          ))}
        </MapView>
        
        {/* Map controls */}
        <View style={styles.controlsContainer}>
          {/* Current location button */}
          <TouchableOpacity
            style={[styles.mapButton, { backgroundColor: colors.card }]}
            onPress={getCurrentLocation}
            disabled={isLoading || !locationPermissionGranted}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={colors.blue[600]} />
            ) : (
              <Ionicons 
                name="locate" 
                size={22} 
                color={locationPermissionGranted ? colors.blue[600] : colors.text + '40'} 
              />
            )}
          </TouchableOpacity>
          
          {/* Zoom in button */}
          <TouchableOpacity
            style={[styles.mapButton, { backgroundColor: colors.card }]}
            onPress={() => {
              if (mapRef.current) {
                // Zoom in by reducing the delta values
                const newRegion = {
                  ...region,
                  latitudeDelta: region.latitudeDelta / 2,
                  longitudeDelta: region.longitudeDelta / 2,
                };
                animateToRegion(newRegion);
              }
            }}
          >
            <Ionicons name="add" size={22} color={colors.text} />
          </TouchableOpacity>
          
          {/* Zoom out button */}
          <TouchableOpacity
            style={[styles.mapButton, { backgroundColor: colors.card }]}
            onPress={() => {
              if (mapRef.current) {
                // Zoom out by increasing the delta values
                const newRegion = {
                  ...region,
                  latitudeDelta: region.latitudeDelta * 2,
                  longitudeDelta: region.longitudeDelta * 2,
                };
                animateToRegion(newRegion);
              }
            }}
          >
            <Ionicons name="remove" size={22} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Selected marker details */}
      {selectedMarker && (
        <Card style={styles.markerDetailsCard}>
          <View style={styles.markerDetailHeader}>
            <Text style={[styles.markerDetailTitle, { color: colors.text }]}>
              {selectedMarker.name}
            </Text>
            
            <TouchableOpacity
              onPress={() => deleteMarker(selectedMarker.id)}
              style={styles.deleteButton}
            >
              <Ionicons name="trash-outline" size={20} color={colors.error} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.markerAddressRow}>
            <Ionicons name="location-outline" size={16} color={colors.text + '80'} style={styles.markerAddressIcon} />
            <Text style={[styles.markerAddress, { color: colors.text + '90' }]}>
              {selectedMarker.address}
            </Text>
          </View>
          
          <View style={styles.markerCoordinatesRow}>
            <Text style={[styles.markerCoordinates, { color: colors.text + '60' }]}>
              {`${selectedMarker.latitude.toFixed(6)}, ${selectedMarker.longitude.toFixed(6)}`}
            </Text>
          </View>
          
          <View style={styles.markerActions}>
            <TouchableOpacity
              style={[styles.markerActionButton, { backgroundColor: colors.blue[50] }]}
              onPress={() => {
                if (mapRef.current) {
                  // Animate to marker
                  animateToRegion({
                    latitude: selectedMarker.latitude,
                    longitude: selectedMarker.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01
                  });
                }
              }}
            >
              <Ionicons name="navigate-outline" size={18} color={colors.blue[600]} />
              <Text style={[styles.markerActionText, { color: colors.blue[600] }]}>
                {t('map.navigate') || "Navigate"}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.markerActionButton, { backgroundColor: colors.blue[50] }]}
              onPress={() => {
                setSelectedMarker(null);
              }}
            >
              <Ionicons name="close-outline" size={18} color={colors.blue[600]} />
              <Text style={[styles.markerActionText, { color: colors.blue[600] }]}>
                {t('map.close') || "Close"}
              </Text>
            </TouchableOpacity>
          </View>
        </Card>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // Error banner
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
  },
  errorText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
  },
  errorCloseButton: {
    padding: 4,
  },
  // Search bar
  searchContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
  },
  clearButton: {
    padding: 4,
  },
  searchButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  // Search history
  searchHistoryContainer: {
    position: 'absolute',
    top: 76,
    left: 16,
    right: 16,
    maxHeight: 200,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    elevation: 4,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  historyItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  historyText: {
    marginLeft: 8,
    fontSize: 14,
  },
  // Map
  mapContainer: {
    flex: 1,
    marginTop: 8,
    borderRadius: 8,
    overflow: 'hidden',
    margin: 16,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  // Map controls
  controlsContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
    alignItems: 'center',
  },
  mapButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  // Marker callout
  calloutContainer: {
    width: 200,
    padding: 12,
    borderRadius: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  calloutTitle: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 4,
  },
  calloutAddress: {
    fontSize: 12,
  },
  // Marker details card
  markerDetailsCard: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 8,
  },
  markerDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  markerDetailTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  deleteButton: {
    padding: 4,
  },
  markerAddressRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  markerAddressIcon: {
    marginRight: 6,
    marginTop: 2,
  },
  markerAddress: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  markerCoordinatesRow: {
    marginBottom: 16,
  },
  markerCoordinates: {
    fontSize: 12,
  },
  markerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  markerActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    flex: 0.48,
  },
  markerActionText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '500',
  },
});

export default MapScreen;