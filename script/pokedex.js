class Pokedex {
  constructor() {
    this.pokemonList = [];
    this.currentOffset = 0;
    this.limit = 20;
    this.selectedPokemon = null;
    this.init();
  }
  async init() {
    await this.loadPokemonList();
    this.setupEventListeners();
  }
  setupEventListeners() {
    document.getElementById('load-more').addEventListener('click', () => {
      this.loadMorePokemon();
    });
  }
  async loadPokemonList() {
    try {
      const loadButton = document.getElementById('load-more');
      loadButton.textContent = 'Loading...';
      loadButton.disabled = true;
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${this.limit}&offset=${this.currentOffset}`);
      const data = await response.json();
      for (const pokemon of data.results) {
        const pokemonData = await this.fetchPokemonData(pokemon.url);
        this.pokemonList.push(pokemonData);
      }
      this.renderPokemonList();
      this.currentOffset += this.limit;
      loadButton.textContent = 'Load More Pokémon';
      loadButton.disabled = false;
      // Select first Pokemon if none selected
      if (!this.selectedPokemon && this.pokemonList.length > 0) {
        this.selectPokemon(this.pokemonList[0]);
      }
    } catch (error) {
      console.error('Error loading Pokemon:', error);
      const loadButton = document.getElementById('load-more');
      loadButton.textContent = 'Error - Try Again';
      loadButton.disabled = false;
    }
  }
  async fetchPokemonData(url) {
    const response = await fetch(url);
    return await response.json();
  }
  renderPokemonList() {
    const grid = document.getElementById('pokemon-grid');
    
    // Clear existing content
    grid.innerHTML = '';
    this.pokemonList.forEach(pokemon => {
      const card = document.createElement('div');
      card.className = 'pokemon-card';
      if (this.selectedPokemon && this.selectedPokemon.id === pokemon.id) {
        card.classList.add('active');
      }
      card.innerHTML = `
        <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
        <h3>${pokemon.name}</h3>
        <div class="card-id">#${pokemon.id.toString().padStart(3, '0')}</div>
      `;
      card.addEventListener('click', () => {
        this.selectPokemon(pokemon);
      });
      grid.appendChild(card);
    });
  }
  selectPokemon(pokemon) {
    this.selectedPokemon = pokemon;
    this.renderPokemonInfo(pokemon);
    this.updateActiveCard();
  }
  renderPokemonInfo(pokemon) {
    const img = document.getElementById('pokemon-img');
    const name = document.getElementById('pokemon-name');
    const id = document.getElementById('pokemon-id');
    const types = document.getElementById('pokemon-types');
    const stats = document.getElementById('pokemon-stats');
    const welcomeMessage = document.querySelector('.welcome-message');
    // Hide welcome message
    if (welcomeMessage) {
      welcomeMessage.style.display = 'none';
    }
    img.src = pokemon.sprites.other['official-artwork']?.front_default || pokemon.sprites.front_default;
    img.alt = pokemon.name;
    name.textContent = pokemon.name;
    id.textContent = `#${pokemon.id.toString().padStart(3, '0')}`;
    // Render types
    types.innerHTML = '';
    pokemon.types.forEach(typeInfo => {
      const typeSpan = document.createElement('span');
      typeSpan.className = `type-box ${typeInfo.type.name}`;
      typeSpan.textContent = typeInfo.type.name.toUpperCase();
      types.appendChild(typeSpan);
    });
    // Render stats
    stats.innerHTML = '';
    pokemon.stats.forEach(statInfo => {
      const statRow = document.createElement('div');
      statRow.className = 'stat-row';
      statRow.innerHTML = `
        <span class="stat-name">${statInfo.stat.name.replace('-', ' ')}</span>
        <span class="stat-value">${statInfo.base_stat}</span>
      `;
      stats.appendChild(statRow);
    });
  }
  updateActiveCard() {
    const cards = document.querySelectorAll('.pokemon-card');
    cards.forEach(card => {
      card.classList.remove('active');
      const cardName = card.querySelector('h3').textContent;
      if (this.selectedPokemon && cardName === this.selectedPokemon.name) {
        card.classList.add('active');
      }
    });
  }
  async loadMorePokemon() {
    await this.loadPokemonList();
  }
}
// Initialize the Pokedex when the page loads
document.addEventListener('DOMContentLoaded', () => {
  new Pokedex();
});