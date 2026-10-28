import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-background px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-display mb-6">Términos y condiciones</h1>
        <p className="text-sm text-ink-muted mb-6">Última actualización: Octubre 2026</p>
        <div className="space-y-6 text-ink">
          <section>
            <h2 className="text-xl font-semibold mb-2">1) Aceptación</h2>
            <p>
              Al usar GESTIONALO, aceptas estos términos y condiciones. Si no estás de acuerdo, no
              utilices la aplicación.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold mb-2">2) Uso del servicio</h2>
            <p>
              GESTIONALO es una herramienta de apoyo para organizar alimentos. Las fechas de
              vencimiento las ingresa el usuario y la app no garantiza la inocuidad de los
              alimentos: siempre verificar el estado real antes de consumir.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold mb-2">3) Datos y privacidad</h2>
            <p>
              En esta versión de prueba los datos se guardan localmente en el navegador del
              usuario. No se envían a servidores externos.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold mb-2">4) Responsabilidad</h2>
            <p>
              Esta es una versión MVP/prototipo académico de la Universidad del Quindío, se ofrece
              "tal cual" sin garantías de ningún tipo.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold mb-2">5) Cambios y contacto</h2>
            <p>
              Estos términos pueden actualizarse. Para preguntas relacionadas con este proyecto
              académico, contactar a través del repositorio.
            </p>
          </section>
        </div>
        <div className="mt-8">
          <Link href="/">
            <Button variant="secondary">Volver</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
