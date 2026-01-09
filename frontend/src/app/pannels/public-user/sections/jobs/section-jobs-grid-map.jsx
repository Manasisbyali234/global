import { GoogleMapsProvider } from "@ubilabs/google-maps-react-hooks";
import { MarkerClusterer, SuperClusterAlgorithm } from "@googlemaps/markerclusterer";
import { useState, useCallback } from "react";
import { publicUrlFor } from "../../../../../globals/constants";

const mapOptions = {
    zoom: 9,
    scrollwheel: true,
    center: {
        lat: 40.80,
        lng: -73.70
    },
    zoomControl: false,
    mapTypeControl: false,
    scaleControl: false,
    panControl: false,
    navigationControl: false,
    streetViewControl: false,
    gestureHandling: 'cooperative',
    styles: [
        {
            "featureType": "administrative.locality",
            "elementType": "all",
            "stylers": [
                {
                    "hue": "#2c2e33"
                },
                {
                    "saturation": 7
                },
                {
                    "lightness": 19
                },
                {
                    "visibility": "on"
                }
            ]
        },
        {
            "featureType": "administrative.locality",
            "elementType": "labels.text",
            "stylers": [
                {
                    "visibility": "on"
                },
                {
                    "saturation": "-3"
                }
            ]
        },
        {
            "featureType": "administrative.locality",
            "elementType": "labels.text.fill",
            "stylers": [
                {
                    "color": "#1967d2"
                }
            ]
        },
        {
            "featureType": "landscape",
            "elementType": "all",
            "stylers": [
                {
                    "hue": "#ffffff"
                },
                {
                    "saturation": -100
                },
                {
                    "lightness": 100
                },
                {
                    "visibility": "simplified"
                }
            ]
        },
        {
            "featureType": "poi",
            "elementType": "all",
            "stylers": [
                {
                    "hue": "#ffffff"
                },
                {
                    "saturation": -100
                },
                {
                    "lightness": 100
                },
                {
                    "visibility": "off"
                }
            ]
        },
        {
            "featureType": "poi.school",
            "elementType": "geometry.fill",
            "stylers": [
                {
                    "color": "#1967d2"
                },
                {
                    "saturation": "0"
                },
                {
                    "visibility": "on"
                }
            ]
        },
        {
            "featureType": "road",
            "elementType": "geometry",
            "stylers": [
                {
                    "hue": "#ff6f00"
                },
                {
                    "saturation": "100"
                },
                {
                    "lightness": 31
                },
                {
                    "visibility": "simplified"
                }
            ]
        },
        {
            "featureType": "road",
            "elementType": "geometry.stroke",
            "stylers": [
                {
                    "color": "#1967d2"
                },
                {
                    "saturation": "0"
                }
            ]
        },
        {
            "featureType": "road",
            "elementType": "labels",
            "stylers": [
                {
                    "hue": "#008eff"
                },
                {
                    "saturation": -93
                },
                {
                    "lightness": 31
                },
                {
                    "visibility": "on"
                }
            ]
        },
        {
            "featureType": "road.arterial",
            "elementType": "geometry.stroke",
            "stylers": [
                {
                    "visibility": "on"
                },
                {
                    "color": "#f3dbc8"
                },
                {
                    "saturation": "0"
                }
            ]
        },
        {
            "featureType": "road.arterial",
            "elementType": "labels",
            "stylers": [
                {
                    "hue": "#bbc0c4"
                },
                {
                    "saturation": -93
                },
                {
                    "lightness": -2
                },
                {
                    "visibility": "simplified"
                }
            ]
        },
        {
            "featureType": "road.arterial",
            "elementType": "labels.text",
            "stylers": [
                {
                    "visibility": "off"
                }
            ]
        },
        {
            "featureType": "road.local",
            "elementType": "geometry",
            "stylers": [
                {
                    "hue": "#e9ebed"
                },
                {
                    "saturation": -90
                },
                {
                    "lightness": -8
                },
                {
                    "visibility": "simplified"
                }
            ]
        },
        {
            "featureType": "transit",
            "elementType": "all",
            "stylers": [
                {
                    "hue": "#e9ebed"
                },
                {
                    "saturation": 10
                },
                {
                    "lightness": 69
                },
                {
                    "visibility": "on"
                }
            ]
        },
        {
            "featureType": "water",
            "elementType": "all",
            "stylers": [
                {
                    "hue": "#e9ebed"
                },
                {
                    "saturation": -78
                },
                {
                    "lightness": 67
                },
                {
                    "visibility": "simplified"
                }
            ]
        }
    ]
}

const locations = [
    ['/job-detail/1', 'images/jobs-company/pic2.jpg', 'Senior Rolling Stock Technician', 'NJ 07932, United States of America', 40.78263477785881, -74.3855024580078, 4, '<i class="fa fa-briefcase"></i>'],
    ['/job-detail/1', 'images/jobs-company/pic3.jpg', 'IT Department Manager', 'NJ 10921, United States of America', 41.3212039026965, -74.35902140895382, 5, '<i class="fa fa-briefcase"></i>'],
    ['/job-detail/1', 'images/jobs-company/pic5.jpg', 'Recreation & Fitness Worker', 'NJ 07481, United States of America', 40.974261526761296, -74.15371440211788, 8, '<i class="fa fa-briefcase"></i>'],
    ['/job-detail/1', 'images/jobs-company/pic2.jpg', 'Senior Web Designer , Developer', 'NJ 07646, United States of America', 40.92222618539489, -74.02393840114132, 9, '<i class="fa fa-briefcase"></i>'],
    ['/job-detail/1', 'images/jobs-company/pic1.jpg', '61 John Street', 'NJ 07481, United States of America', 40.84422081239799, -74.27912244349648, 13, '<i class="fa fa-briefcase"></i>'],
    ['/job-detail/1', 'images/jobs-company/pic5.jpg', 'Recreation & Fitness Worker', 'NJ 07646, United States of America', 40.79520211025921, -74.35534009486366, 14, '<i class="fa fa-briefcase"></i>'],
    ['/job-detail/1', 'images/jobs-company/pic4.jpg', 'Art Production Specialist', 'st Street, Mineola, NY 11501, United States of America', 40.69722959123321, -74.4068385079496, 10, '<i class="fa fa-briefcase"></i>'],
    ['/job-detail/1', 'images/jobs-company/pic2.jpg', 'Senior Rolling Stock Technician', 'NY 11798, United States of America', 40.79381588568169, -74.99666699916054, 15, '<i class="fa fa-briefcase"></i>'],
    ['/job-detail/1', 'images/jobs-company/pic3.jpg', 'IT Department Manager', 'NY 11782, United States of America', 40.7686857353089, -75.14704236537148, 16, '<i class="fa fa-briefcase"></i>'],
    ['/job-detail/1', 'images/jobs-company/pic2.jpg', 'Senior Web Designer , Developer', '1363-1385 Sunset Blvd Los Angeles, CA 90026, USA', 40.66963252905638, -75.34685620814491, 17, '<i class="fa fa-briefcase"></i>'],
];

function SectionJobsGridMap() {

    const [mapContainer, setMapContainer] = useState(null);
    const onLoad = useCallback(map => addMarkers(map), []);

    return (
        <>
            <GoogleMapsProvider
                googleMapsAPIKey="AIzaSyD_8C7p0Ws2gUu7wo0b6pK9Qu7LuzX2iWY"
                mapOptions={mapOptions}
                mapContainer={mapContainer}
                onLoadMap={onLoad}>
                <div ref={(node) => setMapContainer(node)} style={{ height: '100vh' }}></div>
            </GoogleMapsProvider>
        </>
    )
}



function addMarkers(map) {

    const google = window.google;

    var boxOptions = {
        disableAutoPan: false,
        alignBottom: true,
        pixelOffset: new google.maps.Size(0, -40),
        zIndex: null,
        closeBoxMargin: "0",
        closeBoxURL: "",
        infoBoxClearance: new google.maps.Size(25, 25),
        isHidden: false,
        pane: "",
        enableEventPropagation: false,
        style: { backgroundColor: 'red' }
    };

    const markers = locations.map(([link, image, title, address, lat, lng, a, icon]) => {

        const infoWindow = new google.maps.InfoWindow();
        const marker = new google.maps.Marker({ position: { lat, lng }, animation: google.maps.Animation.DROP });

        marker.addListener("mouseover", () => {
            if (marker.getAnimation() !== null) {
                marker.setAnimation(null);
            } else {
                marker.setAnimation(google.maps.Animation.BOUNCE);
            }
        });

        marker.addListener("mouseout", () => {
            marker.setAnimation(null);
        });

        marker.addListener('click', () => {
            infoWindow.close();
            infoWindow.setPosition({ lat, lng });
            infoWindow.setOptions(boxOptions);
            infoWindow.setContent(
                `<div class="map-box">
                    <a href=${link} class="listing-img-container">
                        <img src=${publicUrlFor(image)} alt="" />
                        <div class="listing-item-content">
                            <h3>${title}</h3>
                            <span>${address}</span>
                        </div>
                    </a>
                </div>`
            );
            infoWindow.open({ map });
        })

        return marker;
    })
    
    new MarkerClusterer({
        map,
        markers,
        algorithm: new SuperClusterAlgorithm({ radius: 200 })
    })
}

export default SectionJobsGridMap;
