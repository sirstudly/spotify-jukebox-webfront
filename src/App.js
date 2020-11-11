import './App.css';
import React from 'react';
import $ from 'jquery';
import 'slick-carousel';

function getImageUrl(imageArr) {
    const preferredImageUrl = imageArr.find(img => img.width >= 250 && img.width <= 350);
    if(preferredImageUrl) {
        return preferredImageUrl.url;
    }
    else if (imageArr.length > 0) {
        return imageArr[0].url;
    }
    return null;
}

class Track extends React.Component {
    constructor(props) {
        super(props);
        this.state = {queueTrackDisabled: false};
    }

    handleQueueTrack(trackUri) {
        console.log("queue track clicked: " + trackUri);
        this.setState({queueTrackDisabled: true});
        fetch("http://192.168.16.4:3000/queue-track?trackUri=" + trackUri)
            .then(resp => resp.text())
            .then(resp => console.log("QUEUE response: " + resp))
            .catch(err => console.error(err));

        // op runs too quickly.. force a delay as to give some user feedback
        setTimeout(() => this.setState({queueTrackDisabled: false}), 2000);
    }

    render() {
        return (
            <div className={"info-card"}>
                {this.props.imageUrl &&
                    <img alt="cover art" src={this.props.imageUrl} width="100%"/>
                }
                <div className="card-title">{this.props.name}</div>
                <div className="card-subtitle">{this.props.artists}</div>
                <button type="button" disabled={this.state.queueTrackDisabled} className="btn btn-block btn-primary mt-2" onClick={() => this.handleQueueTrack(this.props.uri)}>
                    {this.state.queueTrackDisabled && <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>} {this.state.queueTrackDisabled ? "Please wait..." : "Queue Track"}</button>
            </div>)
    }
}

class TrackList extends React.Component {

    render() {
        const trackResults = this.props.tracks.map(track =>
            <Track key={track.id} name={track.name}
                   artists={track.artists.map(a => a.name).join(", ")}
                   imageUrl={getImageUrl(track.album.images)}
                   uri={track.uri}/>
        );
        return (
            <div id="tracks" className={"container"} data-slick-container={true}>
                {trackResults}
            </div>
        )
    }
}

class Artist extends React.Component {
    render() {
        return (
            <div className={"info-card"}>
                {this.props.url &&
                <img alt="cover art" src={this.props.url} width="100%"/>
                }
                <div className="card-title">{this.props.name}</div>
                <button type="button" className="btn btn-block btn-primary mt-2">Play Artist</button>
            </div>)
    }
}

class ArtistList extends React.Component {

    render() {
        const artistResults = this.props.artists.map(artist =>
            <Artist key={artist.id} name={artist.name} url={getImageUrl(artist.images)}/>
        );
        return (
            <div id="artists" className={"container"} data-slick-container={true}>
                {artistResults}
            </div>
        )
    }
}

class Album extends React.Component {
    render() {
        return (
            <div className={"info-card"}>
                {this.props.url &&
                <img alt="cover art" src={this.props.url} width="100%"/>
                }
                <div className="card-title">{this.props.name}</div>
                <button type="button" className="btn btn-block btn-primary mt-2">Play Album</button>
            </div>)
    }
}

class AlbumList extends React.Component {

    render() {
        const albumResults = this.props.albums.map(album =>
            <Album key={album.id} name={album.name} url={getImageUrl(album.images)}/>
        );
        return (
            <div id="albums" className={"container"} data-slick-container={true}>
                {albumResults}
            </div>
        )
    }
}

class Playlist extends React.Component {
    render() {
        return (
            <div className={"info-card"}>
                {this.props.url &&
                <img alt="cover art" src={this.props.url} width="100%"/>
                }
                <div className="card-title">{this.props.name}</div>
                <button type="button" className="btn btn-block btn-primary mt-2">Play Artist</button>
            </div>)
    }
}

class Playlists extends React.Component {

    render() {
        const playlistResults = this.props.playlists.map(playlist =>
            <Playlist key={playlist.id} name={playlist.name} url={getImageUrl(playlist.images)}/>
        );
        return (
            <div id="playlists" className={"container"} data-slick-container={true}>
                {playlistResults}
            </div>
        )
    }
}

class SearchResults extends React.Component {

    render() {
        return (
            <div>
                {this.props.tracks.length ? <h3>Tracks</h3> : null}
                <TrackList tracks={this.props.tracks}/>
                {this.props.artists.length ? <h3>Artists</h3> : null}
                <ArtistList artists={this.props.artists}/>
                {this.props.albums.length ? <h3>Albums</h3> : null}
                <AlbumList albums={this.props.albums}/>
                {this.props.playlists.length ? <h3>Playlists</h3> : null}
                <Playlists playlists={this.props.playlists}/>
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

    handleChange(event) {
        this.setState({searchTerms: event.target.value});
        console.log("state change: " + event.target.value)
    }

    handleClick(event) {
        console.log("button clicked");
        console.log(event);
        event.preventDefault();
        fetch("http://192.168.16.4:3000/search-all?terms=" + encodeURI(this.state.searchTerms))
            .then(resp => resp.json())
            .then(resp => {
                console.log("Got a response back!");
                console.log(resp);
                $(".slick-initialized").slick("unslick"); // destroy previous instances
                this.setState({
                    tracks: resp.tracks.items,
                    albums: resp.albums.items,
                    artists: resp.artists.items,
                    playlists: resp.playlists.items
                }, () => {
                    $("div[data-slick-container]").slick({
                        // default options
                        dots: false,
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
                                    slidesToScroll: 2
                                }
                            },
                            {
                                breakpoint: 480,
                                settings: {
                                    slidesToShow: 1,
                                    slidesToScroll: 1
                                }
                            }
                            // You can unslick at a given breakpoint now by adding:
                            // settings: "unslick"
                            // instead of a settings object
                        ]
                    }); // fire up the carousel
                    $("div[data-slick-container]").on('afterChange', function(event, slick, currentSlide, nextSlide){
                        console.log("afterChange", event, slick, currentSlide, nextSlide);
                        if (slick.currentSlide + (2 * slick.options.slidesToScroll) >= slick.slideCount) {
                            console.log("need to load new slides")
                            fetch("http://192.168.16.4:3000/search-all?terms=" + encodeURI(this.state.searchTerms) + "&types=track&skip=" + slick.slideCount)
                                .then(resp => resp.json())
                                .then(resp => {
                                    console.log("Got a track response back!");
                                    console.log(resp);
                                    this.setState({
                                        tracks: this.state.tracks.concat(resp.tracks.items)
                                    });
                                })
                                .catch(err => console.error(err));
                        }
                    }.bind(this));
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
                <div className="container-fluid">
                    <form>
                        <div className="form-group input-group row justify-content-center">
                            <div className="col-9 pr-0">
                                <input type="text" className="form-control" value={this.state.searchTerms}
                                       onChange={this.handleChange} placeholder="Search for anything..."/>
                            </div>
                            <div className="col-1 pl-0 input-group-append">
                                <button type="button" className="btn btn-primary" onClick={this.handleClick}>Search
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
                <SearchResults tracks={this.state.tracks} artists={this.state.artists}
                               albums={this.state.albums} playlists={this.state.playlists}/>
            </div>
        );
  }
}

function App() {
  return (
      <div className="App">
          <Spotify/>
      </div>
  );
}

export default App;
