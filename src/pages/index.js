import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'gatsby';
import { Box, Row, Text, useWindowDimensions } from 'elemental-react';

import MapGL, { Popup, Marker } from 'react-map-gl';
import useSwr from 'swr';
import useSupercluster from 'use-supercluster';

import { QRCode } from '@elemental-zcash/components';

import 'mapbox-gl/dist/mapbox-gl.css';

import DefaultButton from '@elemental-zcash/components/lib/buttons/DefaultButton';

import Layout from '../components/layout';
import SEO from '../components/seo';
import useWindowViewport from '../hooks/use-window-viewport';
import { decipherString } from '../utils/cipher';
import { Markers } from '../map/marker';
import { HEADER_HEIGHT } from '../components/header';

import _places from '../map/places-tmp.json';

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


  return {
    id: p,
    type,
    name,
    tags,
    location: {
      latitude: lat,
      longitude: lng,
    },
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

function Pin({size = 20, onClick}) {
  return (
    <svg height={size} viewBox="0 0 24 24" style={pinStyle} onClick={onClick}>
      <path d={ICON} />
    </svg>
  );
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
  const { width, height } = useWindowDimensions();
  const [navOverlayOpen, setNavOverlayOpen] = useState(false);
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

  if (bounds) {
    // debugger;
    console.log({ bounds });
  }

  const { clusters, supercluster } = useSupercluster({
    points,
    bounds,
    zoom: viewport.zoom,
    options: { radius: 75, maxZoom: 20 }
  });


  useEffect(async () => {
    if (mapRef.current) {
      setBounds(mapRef.current.getMap().getBounds().toArray().flat());
    }
  }, [mapRef.current]);

  const [markers, setMarkers] = useState([{ longitude: -0.15667150962827356, latitude: 51.50642925407983 } ]);

  const tileWidth = 64;

  return (
    <Layout>
      <SEO title="Home | Elemental Zcash Design System" />
      {/* <Box width="100vw"> */}
      <Box bg="white" width="100%" minHeight={`calc(100vh - ${HEADER_HEIGHT})`} flex={1}>
        <Box alignItems="center" justifyContent="center" flex={1}>
          {/* <Text fontSize="h4" mb={4}>Welcome to{'\n'}Elemental Zcash!</Text>
          <Link to="/react/getting-started">
            <DefaultButton style={{ cursor: 'pointer' }}>
              Get started
            </DefaultButton>
          </Link> */}
          <Map
            ref={mapRef}
            // position="sticky"
            style={{ flex: 1, width: '100%', height: height - HEADER_HEIGHT }}
            // height={}
            // minHeight={512}
            // width="100%"
            // zoom={viewport.zoom}
            viewport={viewport}
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
                      p="16px"
                      alignItems="center"
                      justifyContent="center"
                      color="white"
                      style={{
                        width: `${10 + (pointCount / points.length) * 20}px`,
                        height: `${10 + (pointCount / points.length) * 20}px`,
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
                        // setViewport({
                        //   ...viewport,
                        //   latitude,
                        //   longitude,
                        //   zoom: expansionZoom,
                        //   transitionInterpolator: new FlyToInterpolator({
                        //     speed: 2
                        //   }),
                        //   transitionDuration: "auto"
                        // });
                      }}
                    >
                      {pointCount}
                    </Box>
                  </Marker>
                );
              }

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
                  <Pin onClick={() => setPopupInfo({ longitude, latitude, ...cluster.properties })} />
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
        </Box>
      </Box>
      {/* </Box> */}
    </Layout>
  );
}

export default Home;
