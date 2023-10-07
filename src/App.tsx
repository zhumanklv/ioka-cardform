import './App.css'
import CardForm from '@/components/CardForm';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: { 
      main: '#1976d2' // default primary color by MUI 
    },
    error: {
      main: '#d32f2f' //default error color by MUI
    }
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
       <CardForm orderId={"b222011d-0048-4376-99f3-5851d7f74b28"}/>
    </ThemeProvider>
  )
}

export default App
