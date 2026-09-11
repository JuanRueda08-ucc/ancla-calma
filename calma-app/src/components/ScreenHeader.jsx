import BackButton from './BackButton'
import AccountMenu from './AccountMenu'

export default function ScreenHeader({ backTo, showAccount = true, accountButtonClassName }) {
  return (
    <div className="mb-7 flex items-center justify-between">
      {backTo ? <BackButton to={backTo} /> : <div />}
      {showAccount ? <AccountMenu buttonClassName={accountButtonClassName} /> : <div />}
    </div>
  )
}
