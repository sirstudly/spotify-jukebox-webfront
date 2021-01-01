import './App.css';
import React from 'react';
import 'slick-carousel';
import Slider from "react-slick";

const SPOTIFY_SERVICE_HOST = process.env.SPOTIFY_SERVICE_HOST || "http://192.168.16.4:3000";

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

const SLIDER_SETTINGS = {
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
                slidesToScroll: 2,
                centerMode: true
            }
        },
        {
            breakpoint: 480,
            settings: {
                slidesToShow: 1,
                slidesToScroll: 1,
                centerMode: true
            }
        }
    ]
};

class PlayableItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = {componentDisabled: false};
    }

    handleQueueTrack(trackUri) {
        console.log("queue track clicked: " + trackUri);
        this.setState({componentDisabled: true});
        fetch(SPOTIFY_SERVICE_HOST + "/queue-track?trackUri=" + trackUri)
            .then(resp => resp.text())
            .then(resp => console.log("QUEUE response: " + resp))
            .catch(err => console.error(err));

        // op runs too quickly.. force a delay as to give some user feedback
        setTimeout(() => this.setState({componentDisabled: false}), 2000);
    }

    handlePlay(uri) {
        console.log("play clicked: " + uri);
        this.setState({componentDisabled: true});
        fetch(SPOTIFY_SERVICE_HOST + "/play?contextUri=" + uri)
            .then(resp => resp.text())
            .then(resp => console.log("PLAY response: " + resp))
            .catch(err => console.error(err));

        // op runs too quickly.. force a delay as to give some user feedback
        setTimeout(() => this.setState({componentDisabled: false}), 2000);
    }
}

class Track extends PlayableItem {
    render() {
        return (
            <div className={"info-card"}>
                {this.props.imageUrl &&
                    <img alt="cover art" src={this.props.imageUrl} width="100%"/>
                }
                <div className="card-title">{this.props.name}</div>
                <div className="card-subtitle">{this.props.artists}</div>
                <button type="button" disabled={this.state.componentDisabled} className="btn btn-block btn-primary mt-2" onClick={() => this.handleQueueTrack(this.props.uri)}>
                    {this.state.componentDisabled && <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>} {this.state.componentDisabled ? "Please wait..." : "Queue Track"}</button>
            </div>)
    }
}

class TrackList extends React.Component {

    constructor(props) {
        super(props);
        this.state = {tracks: []}; // additional tracks (on top of ones in props)
        this.handleAfterChange = this.handleAfterChange.bind(this);
    }

    handleAfterChange(currentSlide) {
        if (currentSlide + (2 * this.slick.props.slidesToScroll) >= this.props.tracks.length + this.state.tracks.length) {
            fetch(SPOTIFY_SERVICE_HOST + "/search-all?terms=" + encodeURI(this.props.searchTerms) + "&types=track&skip=" + this.state.tracks.length)
                .then(resp => resp.json())
                .then(resp => {
                    this.setState({
                        tracks: this.state.tracks.concat(resp.tracks.items)
                    });
                })
                .catch(err => console.error(err));
        }
    }

    render() {
        const trackResults = this.props.tracks.concat(this.state.tracks).map(track =>
            <Track key={track.id} name={track.name}
                   artists={track.artists.map(a => a.name).join(", ")}
                   imageUrl={getImageUrl(track.album.images)}
                   uri={track.uri}/>
        );
        return (
            <Slider id="tracks" className={"container"} ref={(slick) => this.slick = slick} afterChange={(i) => this.handleAfterChange(i)} {...SLIDER_SETTINGS}>
                {trackResults}
            </Slider>
        )
    }
}

class Artist extends PlayableItem {
    render() {
        return (
            <div className={"info-card"}>
                {this.props.url &&
                <img alt="cover art" src={this.props.url} width="100%"/>
                }
                <div className="card-title">{this.props.name}</div>
                <button type="button" disabled={this.state.componentDisabled} className="btn btn-block btn-primary mt-2" onClick={() => this.handlePlay("spotify:artist:" + this.props.id)}>
                    {this.state.componentDisabled && <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>} {this.state.componentDisabled ? "Please wait..." : "Play Artist"}</button>
                <button type="button" disabled={this.state.componentDisabled} className="btn btn-block btn-primary mt-2" onClick={() => this.handlePlay("spotify:radio:artist:" + this.props.id)}>
                    {this.state.componentDisabled && <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>} {this.state.componentDisabled ? "Please wait..." : "Play Artist Radio"}</button>
            </div>)
    }
}

class ArtistList extends React.Component {

    render() {
        const artistResults = this.props.artists.map(artist =>
            <Artist key={artist.id} name={artist.name} url={getImageUrl(artist.images)} id={artist.id}/>
        );
        return (
            <Slider id="artists" className={"container"} {...SLIDER_SETTINGS}>
                {artistResults}
            </Slider>
        )
    }
}

class Album extends PlayableItem {
    render() {
        return (
            <div className={"info-card"}>
                {this.props.url &&
                <img alt="cover art" src={this.props.url} width="100%"/>
                }
                <div className="card-title">{this.props.name}</div>
                <button type="button" disabled={this.state.componentDisabled} className="btn btn-block btn-primary mt-2" onClick={() => this.handlePlay("spotify:album:" + this.props.id)}>
                    {this.state.componentDisabled && <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>} {this.state.componentDisabled ? "Please wait..." : "Play Album"}</button>
                <button type="button" disabled={this.state.componentDisabled} className="btn btn-block btn-primary mt-2" onClick={() => this.handlePlay("spotify:radio:album:" + this.props.id)}>
                    {this.state.componentDisabled && <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>} {this.state.componentDisabled ? "Please wait..." : "Play Album Radio"}</button>
            </div>)
    }
}

class AlbumList extends React.Component {

    render() {
        const albumResults = this.props.albums.map(album =>
            <Album key={album.id} name={album.name} url={getImageUrl(album.images)} id={album.id}/>
        );
        return (
            <Slider id="albums" className={"container"} {...SLIDER_SETTINGS}>
                {albumResults}
            </Slider>
        )
    }
}

class Playlist extends PlayableItem {
    render() {
        return (
            <div className={"info-card"}>
                {this.props.url &&
                <img alt="cover art" src={this.props.url} width="100%"/>
                }
                <div className="card-title">{this.props.name}</div>
                <button type="button" disabled={this.state.componentDisabled} className="btn btn-block btn-primary mt-2" onClick={() => this.handlePlay("spotify:playlist:" + this.props.id)}>
                    {this.state.componentDisabled && <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>} {this.state.componentDisabled ? "Please wait..." : "Set Playlist"}</button>
                <button type="button" disabled={this.state.componentDisabled} className="btn btn-block btn-primary mt-2" onClick={() => this.handlePlay("spotify:radio:playlist:" + this.props.id)}>
                    {this.state.componentDisabled && <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>} {this.state.componentDisabled ? "Please wait..." : "Set Playlist Radio"}</button>
            </div>)
    }
}

class Playlists extends React.Component {

    render() {
        const playlistResults = this.props.playlists.map(playlist =>
            <Playlist key={playlist.id} name={playlist.name} url={getImageUrl(playlist.images)} id={playlist.id}/>
        );
        return (
            <Slider id="playlists" className={"container"} {...SLIDER_SETTINGS}>
                {playlistResults}
            </Slider>
        )
    }
}

class SearchResults extends React.Component {

    render() {
        return (
            <div>
                {this.props.tracks.length ? <div><h3>Tracks</h3><TrackList searchTerms={this.props.searchTerms} tracks={this.props.tracks}/></div> : null}
                {this.props.artists.length ? <div><h3>Artists</h3><ArtistList artists={this.props.artists}/></div> : null}
                {this.props.albums.length ? <div><h3>Albums</h3><AlbumList albums={this.props.albums}/></div> : null}
                {this.props.playlists.length ? <div><h3>Playlists</h3><Playlists playlists={this.props.playlists}/></div> : null}
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
        fetch(SPOTIFY_SERVICE_HOST + "/search-all?terms=" + encodeURI(this.state.searchTerms))
            .then(resp => resp.json())
            .then(resp => {
                console.log("Got a response back!");
                console.log(resp);
                this.setState({
                    tracks: resp.tracks.items,
                    albums: resp.albums.items,
                    artists: resp.artists.items,
                    playlists: resp.playlists.items
                });
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
                    <form onSubmit={this.handleClick}>
                        <div className="form-group input-group row justify-content-center">
                            <div className="col-9 pr-0">
                                <input type="text" className="form-control" value={this.state.searchTerms}
                                       onChange={this.handleChange} placeholder="Search for anything..."/>
                            </div>
                            <div className="col-1 pl-0 input-group-append">
                                <button type="submit" className="btn btn-primary">Search</button>
                            </div>
                        </div>
                    </form>
                </div>
                <SearchResults searchTerms={this.state.searchTerms} tracks={this.state.tracks} artists={this.state.artists}
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
