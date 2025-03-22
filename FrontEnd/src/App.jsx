import './App.css'
import ConversationBar from './components/ConversationBar'
import '@mantine/core/styles.css'
import { MantineProvider } from '@mantine/core'
import PopUpNewConversation from './components/PopUpNewConversation'

function App() {

  return (
    <MantineProvider>
        <ConversationBar/>
    </MantineProvider>
  )
}

export default App
