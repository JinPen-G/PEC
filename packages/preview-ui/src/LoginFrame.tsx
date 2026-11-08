/** Fixed Rental OS LoginPage composition. The host owns only brand copy,
 * appearance controls and the local form; no tenant/auth provider is imported. */
import type { ReactNode } from 'react';

export function LoginFrame({
  brand,
  title,
  description,
  highlights,
  footer,
  appearance,
  children,
}: {
  brand: ReactNode;
  title: string;
  description: string;
  highlights: { title: string; description: string }[];
  footer: string;
  appearance: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="login-stage preview-native-login">
      <div className="login-frame">
        <div className="login-appearance">{appearance}</div>
        <main className="login-workspace">
          <div className="login-card">
            <aside className="login-card-brand" aria-labelledby="login-brand-heading">
              <div className="login-brand-background login-brand-background--generated" aria-hidden="true" />
              <div className="login-brand login-brand--hero login-brand--platform">{brand}</div>
              <div className="login-card-brand-copy">
                <h1 id="login-brand-heading" className="login-card-brand-title">
                  {title}
                </h1>
                <div className="login-brand-description">
                  {description.split(/\n\s*\n/u).map((paragraph, index) => (
                    <p className="login-card-brand-tagline" key={index}>
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
              <div className="login-card-brand-footer">
                <dl className="login-brand-capabilities">
                  {highlights.map((item) => (
                    <div key={item.title}>
                      <dt>{item.title}</dt>
                      <dd>{item.description}</dd>
                    </div>
                  ))}
                </dl>
                <p className="login-brand-note">{footer}</p>
              </div>
            </aside>
            <div className="login-card-form">
              <div className="login-brand login-brand--compact login-brand--platform">{brand}</div>
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
