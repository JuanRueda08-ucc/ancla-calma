import BackButton from './BackButton'
import AccountMenu from './AccountMenu'
import TemaToggle from './TemaToggle'
import EsquinasPantalla from './EsquinasPantalla'

// Los botones van en las esquinas de la página (EsquinasPantalla); aquí queda
// solo un espacio vacío del mismo alto para que el contenido empiece donde
// siempre. pt con safe-area: en la app instalada en iPhone la pantalla se
// dibuja detrás de la barra de estado (hora, batería).
// El botón de tema va siempre en la esquina, así no se mueve entre pantallas
// con y sin cuenta (Login, Perfil...); la cuenta va a su izquierda.
export default function ScreenHeader({ backTo, showAccount = true, accountButtonClassName }) {
  return (
    <>
      <div className="mb-7 box-content h-[38px] pt-[env(safe-area-inset-top)]" aria-hidden="true" />
      <EsquinasPantalla
        izquierda={backTo && <BackButton to={backTo} />}
        derecha={
          <>
            {showAccount && <AccountMenu buttonClassName={accountButtonClassName} />}
            <TemaToggle className={accountButtonClassName} />
          </>
        }
      />
    </>
  )
}
