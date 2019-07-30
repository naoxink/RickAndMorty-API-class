class Ram {

  constructor(){
    this.baseURL = 'https://rickandmortyapi.com/api/'
    this.URLS = {
      'api': this.baseURL,
      'characters': `${this.baseURL}character/`,
      'locations':`${this.baseURL}location/`,
      'episodes':`${this.baseURL}episode/`
    }
  }

  _buildParams(paramsObj){
    var result = [  ]
    for(var k in paramsObj){
      if(paramsObj.hasOwnProperty(k) && paramsObj[k] !== null && typeof paramsObj[k] !== 'undefined'){
        result.push(k + '=' + paramsObj[k])
      }
    }
    return result.join('&')
  }

  _call({ url, params }, callback){
    if(params) url += `?${this._buildParams(params)}`
    fetch(url).then(response => response.json()).then(callback)
  }

  sections(callback){
    this._call({ 'url': this.URLS.api }, callback)
  }

  _formatCharacters(list){
    return list.map(e => {
      return {
        'name': e.name,
        'value': e.id
      }
    })
  }

  characters(page, callback){
    this._call({
      'url': this.URLS.characters,
      'params': {
        'page': page || 0
      }
    }, results => callback(this._formatCharacters(results.results)))
  }

  character(charId, callback){
    this._call({
      'url': this.URLS.characters + charId
    }, char => this.populate([ char ], 'episode', 'episodes', callback))
  }

  _formatLocations(list){
    return list.map(e => {
      return {
        'name': e.name,
        'value': e.id
      }
    })
  }

  locations(page, callback){
    this._call({
      'url': this.URLS.locations,
      'params': {
        'page': page || 0
      }
    }, results => callback(this._formatLocations(results.results)))
  }

  _formatEpisodes(list){
    return list.map(e => {
      return {
        'name': `${e.name} (${e.episode})`,
        'value': e.id
      }
    })
  }

  episodes(page, callback){
    this._call({
      'url': this.URLS.episodes,
      'params': {
        'page': page || 0
      }
    }, results => callback(this._formatEpisodes(results.results)))
  }

  location(locId, callback){
    this._call({
      'url': this.URLS.locations + locId
    }, location => this.populate([ location ], 'residents', 'characters', callback))
  }

  episode(epId, callback){
    this._call({
      'url': this.URLS.episodes + epId
    }, episode => this.populate([ episode ], 'characters', 'characters', callback))
  }

  populate(items, field, model, callback){
    const promises = [  ]
    for(let i = 0; i < items.length; i++){
      promises.push(new Promise((resolve, reject) => {
        this.populateItem(items[i], field, model, resolve)
      }))
    }
    Promise.all(promises).then(res => callback(res))
  }

  populateItem(item, field, model, callback){
    const promises = [  ]
    item[field].forEach(url => {
      promises.push(new Promise((resolve, reject) => {
        this._call({ url }, complete => resolve(complete.name))
      }))
    })
    Promise.all(promises).then(res => {
      item[field] = res
      callback(item)
    })
  }

  searchCharacter(query, page, callback){
    this._call({
      'url': this.URLS.characters,
      'params': {
        'page': page || 0,
        'name': query
      }
    }, results => callback(this._formatCharacters(results.results)))
  }

  searchLocation(query, page, callback){
    this._call({
      'url': this.URLS.locations,
      'params': {
        'page': page || 0,
        'name': query
      }
    }, results => callback(this._formatLocations(results.results)))
  }

  searchEpisode(query, page, callback){
    this._call({
      'url': this.URLS.episodes,
      'params': {
        'page': page || 0,
        'episode': query
      }
    }, results => callback(this._formatEpisodes(results.results)))
  }

}
