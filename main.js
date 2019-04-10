async function simulateApi () {
    return new Promise( resolve => {
        let arr = []; 
        for (let i=0; i<4; i++) {
            arr.push({
                id: Math.random() + '',
                name: `name${Math.random().toFixed(2)}`,
                children: []
            })
        }
        
        setTimeout( () => resolve( arr ), 1000 );
    });
}

function Selector(props){
  return (
    <div>
      <span>Level { props.level }</span>
      <select 
        data-level={ props.level }
        defaultSelected={ props.data[0] ? props.data[0].name : 'none' } 
        onChange={ props.handleChange }
      >
        <option value='none'> Выберите </option>
        { props.data.map( el =>
           <option key={ el.id } value={ el.name } > { el.name } </option>
        )}
      </select>
    </div>
  )
}

class App extends React.Component {
  state = {
    data: [],
    selectors: ['first'],
    errors: []
  }

  componentDidMount(){
    const { errors } = this.state;

    simulateApi()
    .then( data => this.setState({ data }))
    .catch( err => this.setState({ errors: errors.concat(err) }) );
  }

  render(){
    const { selectors, data } = this.state; 
    return (
      <>
        { 
          selectors.map( (el, idx) => 
            <Selector 
              handleChange = { this.handleChange } 
              level = { idx } 
              data = { !idx ? data : this.parseWay(idx) }
            />
          ) 
        }
      </>
    )
  }

  parseWay = ( level, current = 0, res = this.state.data ) => {
    const { selectors } = this.state;
    if  (current === level) {
      return res; 
    }
    
    const idx = selectors[current + 1];
    const founded = res[idx];

    return this.parseWay( level, current + 1, founded.children );
  }
  
  parseLevels = ( selectors, newData, bufferData = [...this.state.data] ) => {
    
    const current = selectors[1];
    
    if ( selectors.length <= 2 ) { 
      bufferData[current] = {
        ...bufferData[current],
        children: newData
      }
    } else {
      bufferData[current] = {
        ...bufferData[current],
        children: this.parseLevels( selectors.slice(1), newData, bufferData[current].children )
      }
    }
    
    return bufferData;
  }
  
  handleChange = ({ target }) => {
    const { selectedIndex, dataset: { level }, value } = target;
    
    if (value === 'none') { return; }
    
    const { selectors, data, errors } = this.state;
    
    let newSelectors = [...selectors];
    
    newSelectors.splice( +level + 1, newSelectors.length, selectedIndex);
    
    simulateApi(/*info here*/)
    .then( res => {
      const newData = this.parseLevels( newSelectors, res );
      this.setState({
        data: newData,
        selectors: newSelectors
      })
    })
    .catch( err => this.setState({ errors: errors.concat(err) }) );
  }
    
}

ReactDOM.render(<App />, document.querySelector('#main'));

