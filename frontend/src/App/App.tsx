import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import AppRoutes from './Routes/AppRoutes'
import { Provider } from 'react-redux'
import { setupStore } from './AppStore'
import { instance } from './AppApi'
import { RestorePendingEmailAction } from '../Entities/Auth'
import AuthApi from '../Entities/Auth/api/AuthApi'
import { restoreSession } from '../Entities/Auth/model/AuthStore'
import './App.scss'

const store = setupStore()
store.dispatch(RestorePendingEmailAction())
const root = createRoot(document.getElementById('root')!)

instance.interceptors.request.use(config => {
  const { accessToken } = store.getState().AuthStore
  if (accessToken && !config.headers.has('Authorization')) {
    config.headers.set('Authorization', `Bearer ${accessToken}`)
  }
  return config
})

root.render(<p role="status">Загрузка…</p>)
void AuthApi.refresh()
  .then(({ data }) => {
    if (typeof data.accessToken === 'string' && data.accessToken) {
      store.dispatch(restoreSession(data.accessToken))
    }
  })
  .catch(() => undefined)
  .finally(() => {
    root.render(
      <BrowserRouter>
        <Provider store={store}>
          <AppRoutes />
        </Provider>
      </BrowserRouter>
    )
  })
