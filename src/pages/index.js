import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'gatsby';
import { Box, Row, Text, useWindowDimensions } from 'elemental-react';

import loadable from '@loadable/component';
import useSwr from 'swr';
import useSupercluster from 'use-supercluster';

import { Svg, Path, G, Rect } from 'react-primitives-svg';

// import { QRCode } from '@elemental-zcash/components';

import FilledCard from '@elemental-zcash/components/lib/cards/FilledCard';

import mapboxgl from 'mapbox-gl';

import 'mapbox-gl/dist/mapbox-gl.css';

import Layout from '../components/layout';
import SEO from '../components/seo';
import useWindowViewport from '../hooks/use-window-viewport';
import { decipherString } from '../utils/cipher';
import { Markers } from '../map/marker';
import { HEADER_HEIGHT } from '../components/header';

import _places from '../map/places-tmp.json';

// const { MapGL, Popup, Marker } = loadable(async () => {
//   // const { default: MapGL, Popup, Marker } = await import('react-map-gl');
//   let MapGL, Popup, Marker = null;

//   return { MapGL, Popup, Marker };
// });

const MapGL = loadable(() => import('react-map-gl'), {
  resolveComponent: (components) => components.default,
});
const Popup = loadable(() => import('react-map-gl'), {
  resolveComponent: (components) => components.Popup,
});
const Marker = loadable(() => import('react-map-gl'), {
  resolveComponent: (components) => components.Marker,
});
// const mapboxgl = loadable(() => import('mapbox-gl'));
// const { Popup, Marker } = MapGL;

if (mapboxgl && typeof window !== 'undefined') {
  mapboxgl.workerClass =
    require("worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker").default
}

const ListIcon = ({ size = 24, fill = '#000' }) => (
  <Svg xmlns="http://www.w3.org/2000/svg" height={size} viewBox="0 0 24 24" width={size}>
    <Path d="M0 0h24v24H0z" fill="none" />
    <Path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" fill={fill} />
  </Svg>
);
const MapIcon = ({ size = 24, fill = '#000' }) => (
  <Svg xmlns="http://www.w3.org/2000/svg" height={size} viewBox="0 0 24 24" width={size}>
    <Path d="M0 0h24v24H0z" fill="none" />
    <Path d="M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z" fill={fill} />
  </Svg>
);

const tToType = {
  0: 'restaurant',
  1: 'food',
  2: 'bar',
  3: 'super',
  4: 'shop',
  5: 'hotel',
  99: 'atm',
  999: 'spa',
  9999: 'tattoo',
};

const tagNames = [
  'Spicy 🌶️',
  'Salty 🥨',
  'Sour 😜',
  'Organic 🐵',
  'Vegetarian 🥕',
  'Vegan 🐮',
  'Healthy 💓',
  'Burger 🍔',
  'Sandwich 🥪',
  'Muffin 🧁', //The muffin icon is invisible
  'Brownie 🥮', //Brownie is invisible too
  'Cake 🎂',
  'Cookie 🍪',
  'Arabic 🥙',
  'Pizza 🍕',
  'Salad 🥗',
  'Smoothie 🥤',
  'Fruit 🍓',
  'IceCream 🍦',
  'Raw 🥦',
  'Handbag 👜',
  'Cosmetic 💅',
  'Tattoo ♣',
  'Piercing 🌀',
  'Souvenir 🎁',
  'Hatha 🧘',
  'Vinyasa 🧘',
  'Massage 💆',
  'Upcycled 🌲',
  'Coffee ☕',
  'NoGluten 🌽',
  'Cocktails 🍹',
  'Beer 🍺',
  'Music 🎵',
  'Chinese 🍜',
  'Duck 🍱',
  'Rock 🎸',
  'LiveDJ 🎧',
  'Terrace ☀️',
  'Seeds 🌱',
  'Grinder 🍌',
  'Papers 🚬',
  'Advice 🌴',
  'Calzone 🥟',
  'Falafel 🥙',
  'MakeUp 🤡',
  'Gifts 🎁',
  'Tapas 🍠',
  'Copas 🍹',
  'Piadina 🌮',
  'Cheese 🧀',
  'Grains 🌾',
  'Fashion 👗',
  'Fair 🤗',
  'Women 👩',
  'Drinks 🍹',
  'TV 📺',
  'Retro 🦄',
  'Feta 🐐',
  'DASH Ð',
  'BTC ₿',
  'BCH ₿',
  'ANYPAY ₿️',
  'ETH ₿',
  'HotDog 🌭',
  'Fast ⏩',
  'Kosher 🦄',
  'Sushi 🍣',
  'Moto 🛵',
  'Coche 🚘',
  'GOCRYPTO ₿',
  'Chicken 🐔',
  'Rabbit 🐰',
  'Potato 🥔',
  'Kumpir 🥔',
  'Kebap 🐄',
  'ATM 🏦',
  'Gyros 🐖',
  'Coconut 🥥',
  'ToGo 📦',
  'Meditation 🧘',
  'Wine 🍷',
  'Champagne 🥂',
  'Alcohol 🍾',
  'Booze 🥃',
  'Pancakes 🥞', //You cant remove because we use fixed indexes, but replace with another string that is unlikely to be typed in by the user
  'Croissant 🥐',
  'Popcorn 🍿',
  'SoftIce 🍦',
  'Dango 🍡',
  'BnB 🛏️',
  'Haircut ✂️',
  'Candy 🍭',
  'Beauty 💅',
  'Miso 🍱',
  'Chocolate 🍫',
  'Rice 🍚',
  'Seafood 🦀',
  'Hostel 🛏️',
  'Fries 🍟',
  'Fish 🐟', //100
  'Chips 🍟',
  'Italian 🇮🇹',
  'Whiskey 🥃',
  ' - - - ', //This is number 104 the no tag indicator, currently not used //TODO hide this field from the suggestions
  'Bourbon 🥃', //105
  'Liquor 🥃',
  'Men ♂️',
  'Pasta 🍝',
  'Dessert 🍬', //109
  'Starter 🥠', //110
  'BBQ 🍗',
  'Noodle 🍜',
  'Korean 🥟',
  'Market 🧺', //invisible item
  'Bread 🥖',
  'Bakery 🥨',
  'Cafe ☕',
  'Games 🎮',
  'Snacks 🍿',
  'Elegant 🕴️',
  'Piano 🎹',
  'Brunch 🍱',
  'Nachos 🌽',
  'Lunch 🥡',
  'Breakfast 🥐',
  'HappyHour 🥳', //hidden item
  'LateNight 🌜',
  'Mexican 🇲🇽',
  'Burrito 🌯',
  'Tortilla 🌮',
  'Indonesian 🇮🇩',
  'Sports 🏆',
  'Pastry 🥧',
  'Bistro 🍲',
  'Soup 🥣',
  'Tea 🍵',
  'Onion',
  'Steak 🥩',
  'Shakes 🥤',
  'Empanadas 🥟',
  'Dinner 🍽️',
  'Sweet 🍭',
  'Fried 🍳',
  'Omelette 🥚',
  'Gin 🍸',
  'Donut 🍩',
  'Delivery 🚚',
  'Cups ☕',
  'Filter',
  'Juice 🍊',
  'Vietnamese 🇻🇳',
  'Pie 🥮', //invisible item
  'Unagi 🐡',
  'Greek 🇬🇷',
  'Japanese 🇯🇵',
  'Tacos 🌮',
  'Kombucha 🍵',
  'Indian 🇮🇳',
  'Nan 🥪',
  'Club 🎶',
  'Honey 🍯',
  'Pool 🎱',
  'Hotel 🏨',
  'Pork 🥓',
  'Ribs 🍖',
  'Kava 🍵',
  'Chai 🍵',
  'Izzy 🍵',
  'Matcha 🍵',
  'Oden 🍢',
  'Latte ☕',
  'DASHText Ð',
  'CoinTigo ₿',
  'CoinText ₿',
  'Salamantex ₿',
  'CryptoBuyer ₿',
  'XPay ₿'
];

const places = _places.filter(({ p }) => p).map(({ p, t, x, y, n, a }) => {
  const type = tToType[t];
  const lat = x;
  const lng = y;
  const name = n;
  const tags = a.split(",").map(n => tagNames[n]);
  const accepts = tags.map((tag) => {
    switch (tag) {
      case 'DASH Ð': { return 'DASH' }
      case 'BTC ₿': { return 'BTC' }
      case 'BCH ₿': { return 'BCH' }
      case 'GOCRYPTO ₿': { return 'GOCRYPTO' }
      case 'DASHText Ð': { return 'DASHText' }
      case 'CoinTigo ₿': { return 'CoinTigo' }
      case 'CoinText ₿': { return 'CoinText' }
      case 'Salamantex ₿': { return 'Salamantex' }
      case 'CryptoBuyer ₿': { return 'CryptoBuyer' }
      case 'XPay ₿': { return 'XPay' }
    }
    return null;
  }).filter(i => i);


  return {
    id: p,
    type,
    name,
    tags,
    location: {
      latitude: lat,
      longitude: lng,
    },
    accepts,
  };
})

const decipheredVal123 = decipherString('405b1e55497a01795a5f595267765a5167050052037e5f51776643537766497959475969637906795d7e42555d04496a774801557471017f675349545e764a55747e015577095c515e615956611e5f44776f6f1d7a6251416f66597a755d625304590061');

const fetcher = (...args) => fetch(...args).then(response => response.json());

// mapboxgl.accessToken = decipheredVal123;

const ICON = `M20.2,15.7L20.2,15.7c1.1-1.6,1.8-3.6,1.8-5.7c0-5.6-4.5-10-10-10S2,4.5,2,10c0,2,0.6,3.9,1.6,5.4c0,0.1,0.1,0.2,0.2,0.3
  c0,0,0.1,0.1,0.1,0.2c0.2,0.3,0.4,0.6,0.7,0.9c2.6,3.1,7.4,7.6,7.4,7.6s4.8-4.5,7.4-7.5c0.2-0.3,0.5-0.6,0.7-0.9
  C20.1,15.8,20.2,15.8,20.2,15.7z`;

const pinStyle = {
  cursor: 'pointer',
  fill: '#d00',
  stroke: 'none'
};

// function Pin({size = 20, onClick}) {
//   return (
//     <svg height={size} viewBox="0 0 24 24" style={pinStyle} onClick={onClick}>
//       <path d={ICON} />
//     </svg>
//   );
// }

const MarkerIcon = ({ size = 24, fill = '#000' }) => (
  <Svg xmlns="http://www.w3.org/2000/svg" height={size} viewBox="0 0 24 24" width={size}>
    <Path d="M0 0h24v24H0z" fill="none" />
    <Path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill={fill} />
  </Svg>
);

const CupIcon = ({ size = 24, fill = '#000' }) => (
  <Svg xmlns="http://www.w3.org/2000/svg" height={size} viewBox="0 0 24 24" width={size}>
    <Path d="M0 0h24v24H0V0z" fill="none" />
    <Path d="M20 3H4v10c0 2.21 1.79 4 4 4h6c2.21 0 4-1.79 4-4v-3h2c1.11 0 2-.9 2-2V5c0-1.11-.89-2-2-2zm0 5h-2V5h2v3zM4 19h16v2H4z" fill={fill} />
  </Svg>
);

const RestaurantIcon = ({ size = 24, fill = '#000' }) => (
  <Svg xmlns="http://www.w3.org/2000/svg" height={size} viewBox="0 0 24 24" width={size}>
    <Path d="M0 0h24v24H0z" fill="none" />
    <Path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z" fill={fill} />
  </Svg>
);
const BarIcon = ({ size = 24, fill = '#000' }) => (
  <Svg xmlns="http://www.w3.org/2000/svg" height={size} viewBox="0 0 24 24" width={size}>
    <Path d="M0 0h24v24H0z" fill="none"/>
    <Path d="M21 5V3H3v2l8 9v5H6v2h12v-2h-5v-5l8-9zM7.43 7L5.66 5h12.69l-1.78 2H7.43z" fill={fill} />
  </Svg>
);
const SuperIcon = ({ size = 24, fill = '#000' }) => (
  <Svg xmlns="http://www.w3.org/2000/svg" height={size} viewBox="0 0 24 24" width={size}>
    <Path d="M0 0h24v24H0z" fill="none" />
    <Path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" fill={fill} />
  </Svg>
);
const ShopIcon = ({ size = 24, fill = '#000' }) => (
  <Svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height={size} viewBox="0 0 24 24" width={size}>
    <G>
      <Rect fill="none" height="24" width="24" />
      <Path d="M18,6h-2c0-2.21-1.79-4-4-4S8,3.79,8,6H6C4.9,6,4,6.9,4,8v12c0,1.1,0.9,2,2,2h12c1.1,0,2-0.9,2-2V8C20,6.9,19.1,6,18,6z M10,10c0,0.55-0.45,1-1,1s-1-0.45-1-1V8h2V10z M12,4c1.1,0,2,0.9,2,2h-4C10,4.9,10.9,4,12,4z M16,10c0,0.55-0.45,1-1,1 s-1-0.45-1-1V8h2V10z" fill={fill} />
    </G>
  </Svg>
);

const HotelIcon = ({ size = 24, fill = '#000' }) => (
  <Svg xmlns="http://www.w3.org/2000/svg" height={size} viewBox="0 0 24 24" width={size}>
    <Path d="M0 0h24v24H0z" fill="none" />
    <Path d="M7 13c1.66 0 3-1.34 3-3S8.66 7 7 7s-3 1.34-3 3 1.34 3 3 3zm12-6h-8v7H3V5H1v15h2v-3h18v3h2v-9c0-2.21-1.79-4-4-4z" fill={fill} />
  </Svg>
);

// 'restaurant',
// 'food',
// 'bar',
// 'super',
// 'shop',
// 'hotel',
// 'atm',
// 'spa',
// 'tattoo',
const categoryIconMap = {
  food: { icon: CupIcon },
  restaurant: { icon: RestaurantIcon },
  bar: { icon: BarIcon },
  super: { icon: SuperIcon },
  shop: { icon: ShopIcon },
  hotel: { icon: HotelIcon },
}

// const StyledMap = props => (
//   <Box as={MapGL} {...props} />
// );

const Map = React.forwardRef(({ viewport, zoom = 9, ...props }, ref) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(-1.123107);
  const [lat, setLat] = useState(52.619397);
  // 52.619397, -1.123107 – Leicester uni

  // 51.5286417, -0.1015986 – London center

  // useEffect(() => {
  //   if (map.current) return; // initialize map only once
  //   map.current = new mapboxgl.Map({
  //     container: mapContainer.current,
  //     style: 'mapbox://styles/mapbox/streets-v11',
  //     center: [lng, lat],
  //     zoom: zoom
  //   });

  //   map.current.on('move', () => {
  //     setLng(map.current.getCenter().lng.toFixed(4));
  //     setLat(map.current.getCenter().lat.toFixed(4));
  //     setZoom(map.current.getZoom().toFixed(2));
  //   });
  // });

  return (
    <>
      <MapGL
        ref={ref}
        initialViewState={viewport}
        style={{
          height: props.height,
          minHeight: props.minHeight,
          width: props.width,
        }}
        mapboxAccessToken={decipheredVal123}
        // width="100%"
        // height={512}
        mapStyle="mapbox://styles/macintoshhelper/ckw3vs4iv6r2b14nxlhd40ipp"
        {...props}
      />
    </>
  )
});


const Home = () => {
  // const viewport = useWindowViewport();
  const [pageViewType, setPageViewType] = useState('map');
  const { width, height } = useWindowDimensions();
  const [navOverlayOpen, setNavOverlayOpen] = useState(false);
  const [placesInView, setPlacesInView] = useState();
  const mapRef = useRef();
  // const [zoom, setZoom] = useState(12);
  const [viewport, setViewport] = useState({
    latitude: 51.5286417,
    longitude: -0.1015986,
    // width: "100vw",
    // height: "100vh",
    zoom: 12
  });
  const [bounds, setBounds] = useState(null);

  const [popupInfo, setPopupInfo] = useState(null);

  // const url =
  //   'https://data.police.uk/api/crimes-street/all-crime?lat=51.5286417&lng=-0.1015986&date=2019-10';
  // const { data, error } = useSwr(url, { fetcher });
  // const crimes = data && !error ? data : [];
  // const merchants = 

  const points = places.map((place) => ({
    type: "Feature",
    properties: {
      cluster: false, 
      placeId: place.id,
      name: place.name,
      tags: place.tags,
      category: place.type,
      accepts: place.accepts,
    },
    geometry: {
      type: "Point",
      coordinates: [
        parseFloat(place.location.longitude),
        parseFloat(place.location.latitude)
      ]
    }
  }));

  

  // useEffect(() => {
  //   if (mapRef.current && viewport) {
  //     console.log('setBounds');
  //     setBounds(mapRef.current.getMap().getBounds().toArray().flat());
  //   }
  // }, [mapRef, viewport, setBounds]);


      //   map.current.on('move', () => {
  //     setLng(map.current.getCenter().lng.toFixed(4));
  //     setLat(map.current.getCenter().lat.toFixed(4));
  //     setZoom(map.current.getZoom().toFixed(2));
  //   });

  const { clusters, supercluster } = useSupercluster({
    points,
    bounds,
    zoom: viewport.zoom,
    options: {
      radius: 75,
      maxZoom: 20,
    },
  });

  useEffect(() => {
    const newPlaceList = [];

    clusters.forEach((cluster) => {
      const [longitude, latitude] = cluster?.geometry?.coordinates;

      if (!cluster?.cluster && !cluster?.properties?.cluster) {
        newPlaceList.push({ longitude, latitude, ...cluster.properties })
      }
    });
    setPlacesInView(newPlaceList);
  }, [clusters])


  const [markers, setMarkers] = useState([{ longitude: -0.15667150962827356, latitude: 51.50642925407983 } ]);

  const tileWidth = 64;

  return (
    <Layout placeItems={placesInView}>
      <SEO title="Home | Elemental Zcash Design System" />
      {/* <Box width="100vw"> */}
      <Box bg="white" width="100%" minHeight={`calc(100vh - ${HEADER_HEIGHT})`} flex={1}>
        <Box position="relative" alignItems="center" justifyContent="center" flex={1}>
          {/* <Text fontSize="h4" mb={4}>Welcome to{'\n'}Elemental Zcash!</Text>
          <Link to="/react/getting-started">
            <DefaultButton style={{ cursor: 'pointer' }}>
              Get started
            </DefaultButton>
          </Link> */}
          <Box display={['flex', 'flex', 'none']} zIndex={10} position="absolute" bottom={64} right={64}>
            <Row
              as="a"
              style={{ cursor: 'pointer' }}
              onPress={() => {
                if (pageViewType === 'map') {
                  setPageViewType('list');
                } else {
                   setPageViewType('map');
                 }
              }}
              alignItems="center"
              height={64}
              bg="greys.9"
              borderRadius="8px"
              p="16px"
            >
              {pageViewType === 'map' && (
                <>
                  <Box size={24} mr={2}>
                    <ListIcon fill="white" />
                  </Box>
                  <Text color="white">View list</Text>
                </>
              )}
              {pageViewType === 'list' && (
                <>
                  <Box size={24} mr={2}>
                    <MapIcon fill="white" />
                  </Box>
                  <Text color="white">View map</Text>
                </>
              )}
            </Row>
          </Box>
          {pageViewType === 'list' && (
            <Box>
              <Text mb={3}>
                Data borrowed from https://bmap.app/ for demo purposes.
              </Text>
              {placesInView?.map((place) => (
                <FilledCard bg="greys.2" p={20} mb={4}>
                  <Text fontSize={20} mb={3}>{place.name}</Text>
                  <Text mb={2}>{place.category}</Text>
                  <Row>
                    {place.tags?.map((tag) => (
                      <Text mr={2} mb={2}>
                        {tag.match(/[\p{Emoji}\u200d]+/gu)}
                      </Text>
                    ))}
                  </Row>
                  {place.accepts?.length > 0 && (
                    <Text>Accepts: {place.accepts.join(', ')}</Text>
                  )}
                </FilledCard>
              ))}
            </Box>
          )}
          {pageViewType === 'map' && (
            <Map
              ref={mapRef}
              // position="sticky"
              style={{ flex: 1, width: '100%', height: height - HEADER_HEIGHT }}
              // height={}
              // minHeight={512}
              // width="100%"
              // zoom={viewport.zoom}
              viewport={viewport}
              onLoad={() => {
                if (mapRef.current) {
                  setBounds(mapRef.current.getMap().getBounds().toArray().flat());
                }
              }}
              onMove={(event) => {
                setViewport({ ...event.viewState });

                if (mapRef.current) {
                  setBounds(mapRef.current.getMap().getBounds().toArray().flat());
                }
              }}
            >
              {/* <Markers markers={[[-0.15667150962827356,51.50642925407983]]} /> */}
              {/* {markers.map((marker, index) => (
                <Marker
                  key={`marker-${index}`}
                  longitude={marker.longitude}
                  latitude={marker.latitude}
                  anchor="bottom"
                >
                  <Pin onClick={() => setPopupInfo(marker)} />
                </Marker>
              ))} */}
              {clusters.map((cluster) => {
                // every cluster point has coordinates
                const [longitude, latitude] = cluster.geometry.coordinates;
                // the point may be either a cluster or a crime point
                const {
                  cluster: isCluster,
                  point_count: pointCount
                } = cluster.properties;

                // we have a cluster to render
                if (isCluster) {
                  return (
                    <Marker
                      key={`cluster-${cluster.id}`}
                      latitude={latitude}
                      longitude={longitude}
                    >
                      <Box
                        className="cluster-marker"
                        bg="#1978c8"
                        borderRadius="50%"
                        p={16 + ((pointCount / points.length) * 40)}
                        alignItems="center"
                        justifyContent="center"
                        color="white"
                        style={{
                          width: 10,
                          height: 10,
                          cursor: 'pointer',
                        }}
                        onClick={() => {
                          const expansionZoom = Math.min(
                            supercluster.getClusterExpansionZoom(cluster.id),
                            20
                          );
                    
                          mapRef.current.flyTo({
                            center: [
                              longitude,
                              latitude,
                            ],
                            zoom: expansionZoom,
                            essential: true // this animation is considered essential with respect to prefers-reduced-motion
                            });
                        }}
                      >
                        <Text fontSize={14} color="white">
                          {pointCount}
                        </Text>
                      </Box>
                    </Marker>
                  );
                }

                const CategoryIconMarker = categoryIconMap[cluster.properties.category]?.icon || 'div';

                // we have a single point (crime) to render
                return (
                  // <Marker
                  //   key={`crime-${cluster.properties.crimeId}`}
                  //   latitude={latitude}
                  //   longitude={longitude}
                  // >
                  //   <button className="crime-marker">
                  //     <img src="/custody.svg" alt="crime doesn't pay" />
                  //   </button>
                  // </Marker>
                  <Marker
                    key={`place-${cluster.properties.placeId}`}
                    longitude={longitude}
                    latitude={latitude}
                    anchor="bottom"
                  >
                    <Box
                      position="relative"
                      onClick={() => setPopupInfo({ longitude, latitude, ...cluster.properties })}
                      style={{ cursor: 'pointer' }}
                    >
                      <MarkerIcon size={32} fill="#202124" />
                      <Box
                        position="absolute"
                        width="100%"
                        height="100%"
                        pb="4px"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <CategoryIconMarker fill="white" size={12} />
                      </Box>
                    </Box>
                  </Marker>
                );
              })}
              {popupInfo ? (
                <Popup
                  anchor="top"
                  longitude={Number(popupInfo.longitude)}
                  latitude={Number(popupInfo.latitude)}
                  closeOnClick={false}
                  onClose={() => setPopupInfo(null)}
                >
                  <Box p={24}>
                    <Text mb={2}>
                      {popupInfo?.name}
                    </Text>
                    <Text mb={2}>
                      {popupInfo?.category}
                    </Text>
                    <Row>
                      {popupInfo?.tags?.map((tag) => (
                        <Text mr={2}>
                          {tag.match(/[\p{Emoji}\u200d]+/gu)}
                        </Text>
                      ))}
                    </Row>
                    {popupInfo?.accepts?.length > 0 && (
                      <Text>Accepts: {popupInfo.accepts.join(', ')}</Text>
                    )}
                    {/* <Text color="primary" mb={3}>
                      Pay 0.1 ZEC to
                    </Text>
                    <Box alignItems="center">
                      {[
                        { bg: 'white', linearGradient: ['#00F9F9', '#0054FF'], borderColor: 'black', borderWidth: '4px' },
                      ].map(({ bg, stroke, borderColor, borderWidth, linearGradient, svgLogo }) => (
                        <QRCode
                          backgroundColor={false}
                          enableLinearGradient={Boolean(linearGradient)}
                          linearGradient={linearGradient}
                          color={stroke}
                          includeMargin={true}
                          size={tileWidth}
                          value={`zcash:${0}?amount=0.001&memo=${0}`}
                          logoBackgroundColor="white"
                          logoBorderRadius={50}
                          svgLogo={svgLogo}
                          svgLogoSize={48}
                        />
                      </Box>
                      ))} */}
                  </Box>
                </Popup>
                ) : null}
            </Map>
          )}
        </Box>
      </Box>
      {/* </Box> */}
    </Layout>
  );
}

export default Home;
