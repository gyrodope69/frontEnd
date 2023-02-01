import Routes from './Routes'
import { ThemeProvider } from '@material-ui/core/styles'
import { createThemes } from './theme'

const App = () => (
  <ThemeProvider theme={createThemes()}>
    <Routes />
  </ThemeProvider>
)

export default App
