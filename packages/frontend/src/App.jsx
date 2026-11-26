import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { AdminAuthProvider } from '@/context/AdminAuthContext'
import { DictionaryProvider } from '@/context/DictionaryContext'
import { QuizProvider } from '@/context/QuizContext'
import PublicLayout from '@/layouts/PublicLayout'
import UserPortalLayout from '@/layouts/UserPortalLayout'
import AdminLayout from '@/layouts/AdminLayout'
import LandingPage from '@/pages/LandingPage'
import KamusPage from '@/pages/KamusPage'
import KuisPage from '@/pages/KuisPage'
import TutorialPage from '@/pages/TutorialPage'

import UserQuizPage from '@/pages/user/UserQuizPage'
import UserDictionaryPage from '@/pages/user/UserDictionaryPage'
import UserProgressPage from '@/pages/user/UserProgressPage'
import UserProfilePage from '@/pages/user/UserProfilePage'

import AdminLoginPage from '@/pages/admin/AdminLoginPage'
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage'
import AdminKamusPage from '@/pages/admin/AdminKamusPage'
import AdminKategoriPage from '@/pages/admin/AdminKategoriPage'
import AdminKuisPage from '@/pages/admin/AdminKuisPage'
import AdminAnalisisPage from '@/pages/admin/AdminAnalisisPage'
import AdminSettingsPage from '@/pages/admin/AdminSettingsPage'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AdminAuthProvider>
          <DictionaryProvider>
            <QuizProvider>
              <Routes>
                {/* Public / Guest Routes */}
                <Route element={<PublicLayout />}>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/kamus" element={<KamusPage />} />
                  <Route path="/kuis" element={<KuisPage />} />
                  <Route path="/tutorial" element={<TutorialPage />} />
                </Route>

                {/* Logged-in User Portal Routes */}
                <Route path="/app" element={<UserPortalLayout />}>
                  <Route index element={<Navigate to="/app/kuis" replace />} />
                  <Route path="kuis" element={<UserQuizPage />} />
                  <Route path="kamus" element={<UserDictionaryPage />} />
                  <Route path="progres" element={<UserProgressPage />} />
                  <Route path="profil" element={<UserProfilePage />} />
                </Route>

                {/* Admin Routes */}
                <Route path="/admin/login" element={<AdminLoginPage />} />
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<Navigate to="/admin/dashboard" replace />} />
                  <Route path="dashboard" element={<AdminDashboardPage />} />
                  <Route path="kamus" element={<AdminKamusPage />} />
                  <Route path="kategori" element={<AdminKategoriPage />} />
                  <Route path="kuis" element={<AdminKuisPage />} />
                  <Route path="analisis" element={<AdminAnalisisPage />} />
                  <Route path="pengaturan" element={<AdminSettingsPage />} />
                </Route>

                {/* Catch-all */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </QuizProvider>
          </DictionaryProvider>
        </AdminAuthProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
