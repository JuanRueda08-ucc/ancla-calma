import BackButton from './BackButton'
import AccountMenu from './AccountMenu'

// pt con safe-area: en la app instalada en iPhone la pantalla se dibuja
// detrás de la barra de estado (hora, batería); este margen baja "Volver" y
// la cuenta justo por debajo. En el navegador y en Android vale 0.
export default function ScreenHeader({ backTo, showAccount = true, accountButtonClassName }) {
  return (
    <div className="mb-7 flex items-center justify-between pt-[env(safe-area-inset-top)]">
      {backTo ? <BackButton to={backTo} /> : <div />}
      {showAccount ? <AccountMenu buttonClassName={accountButtonClassName} /> : <div />}
    </div>
  )
}
