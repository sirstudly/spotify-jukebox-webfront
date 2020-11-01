//import logo from './logo.svg';
import './App.css';
import React from 'react';
import $ from 'jquery';
import 'slick-carousel';
//window.$ = window.jQuery = require('jquery')
//import {appendScript} from './appendScript'
/*
// appends script to end of body
const appendScript = (scriptToAppend) => {
    const script = document.createElement("script");
    script.src = scriptToAppend;
    script.async = true;
    document.body.appendChild(script);
}
 */

class Artist extends React.Component {
    render() {
        return (<div>{this.props.name}</div>)
    }
}

class Track extends React.Component {
    render() {
        return (
            <div>
                {this.props.url &&
                    <img alt="" src={this.props.url}/>
                }
                {this.props.name} by {this.props.artists}
            </div>)
    }
}

class TrackList extends React.Component {

    getImageUrl(imageArr) {
        const preferredImageUrl = imageArr.find(img => img.width > 50 && img.width < 100);
        if(preferredImageUrl) {
            return preferredImageUrl.url;
        }
        else if (imageArr.length > 0) {
            return imageArr[0].url;
        }
        return null;
    }

    render() {
        const trackResults = [];
        this.props.tracks.forEach((track) => {
            trackResults.push(
                <Track key={track.id} name={track.name}
                       artists={track.artists.map(a => a.name).join(", ")}
                       url={this.getImageUrl(track.album.images)}/>);
        });
        return (
            <div id="tracks" className={"container"} data-slick-container={true}>
                {trackResults}
            </div>
        )
    }
}

class SearchResults extends React.Component {

    render() {
        const artistResults = [];
        artistResults.find(img => img.width === 300)
        this.props.artists.forEach((artist) => {
            artistResults.push(<Artist key={artist.id} name={artist.name}/>);
        });

        return (
            <div>
                <h3>Tracks</h3>
                <TrackList tracks={this.props.tracks}/>
                <h3>Artists</h3>
                <div id="artists">
                    {artistResults}
                </div>
            </div>
        )
    };
}

class Spotify extends React.Component {
    constructor(props) {
        super(props);
        this.state = {searchTerms: '', tracks: [], artists: [], albums: [], playlists: []};

        this.handleChange = this.handleChange.bind(this);
        this.handleClick = this.handleClick.bind(this);
    }

    componentDidMount() {
//        appendScript("//cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick.min.js");
    }

    handleChange(event) {
        this.setState({searchTerms: event.target.value});
        console.log("state change: " + event.target.value)
    }

    handleClick(event) {
        console.log("button clicked");
        console.log(event);
        fetch("http://192.168.16.4:3000/search-other?terms=" + encodeURI(this.state.searchTerms))
            .then(resp => resp.json())
            .then(resp => {
                console.log("Got a response back!");
                console.log(resp);
                this.setState({
                    tracks: resp.tracks.items,
                    albums: resp.albums.items,
                    artists: resp.artists.items,
                    playlists: resp.playlists.items
                }, () => {
                    $("div[data-slick-container]").slick({
                        // default options
                        dots: true,
                        infinite: false,
                        speed: 300,
                        slidesToShow: 4,
                        slidesToScroll: 4,
                        responsive: [
                            {
                                breakpoint: 1024,
                                settings: {
                                    slidesToShow: 3,
                                    slidesToScroll: 3
                                }
                            },
                            {
                                breakpoint: 600,
                                settings: {
                                    slidesToShow: 2,
                                    slidesToScroll: 2,
                                    dots: false
                                }
                            },
                            {
                                breakpoint: 480,
                                settings: {
                                    slidesToShow: 1,
                                    slidesToScroll: 1,
                                    dots: false
                                }
                            }
                            // You can unslick at a given breakpoint now by adding:
                            // settings: "unslick"
                            // instead of a settings object
                        ]
                    }); // fire up the carousel
                } );
            })
            .catch(err => console.error(err));
    }

    render() {
    return (
        <div>
          <div>
            Now Playing....
          </div>
          <div>
              <input type="text" value={this.state.searchTerms} onChange={this.handleChange} />
              <button onClick={this.handleClick}>Search</button>
          </div>
            <SearchResults tracks={this.state.tracks} artists={this.state.artists} albums={this.state.albums} playlists={this.state.playlists}/>
        </div>
    );
  }
}

function App() {
  return (
      <div className="App">
          <Spotify/>
          <script type="text/javascript">
              $(document).ready(function () {console.log("page loaded.")});
          </script>
      </div>
  );
}

export default App;
