import React from 'react';
import FullScreenSlider from './components/FullScreenSlider';
import { slides } from './slidesData';

function App() {
  return (
    <div className="App">
      <FullScreenSlider slides={slides} />
    </div>
  );
}

export default App;