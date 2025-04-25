import './App.css';
import CustomMap from './CustomMap';
import { APIProvider } from "@vis.gl/react-google-maps";

function App() {
  console.log(process.env.REACT_APP_GOOGLE_MAPS_API_KEY)
  return (
    <APIProvider>
    <CustomMap apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}/>
    </APIProvider>
  );
}

export default App;
