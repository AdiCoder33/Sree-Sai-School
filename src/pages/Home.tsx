
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { School, Users, BookOpen, Trophy, Phone, Mail, MapPin, GraduationCap } from 'lucide-react';

export const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <School className="h-8 w-8 sm:h-10 sm:w-10 text-blue-600" />
              <div>
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                  Sree Sai English Medium High School
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">
                  Excellence in Education Since 1995
                </p>
              </div>
            </div>
            <Link to="/login">
              <Button className="bg-blue-600 hover:bg-blue-700 text-sm sm:text-base px-4 sm:px-6">
                Login
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6">
            Welcome to Sree Sai English Medium High School
          </h2>
          <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 mb-8 sm:mb-12 max-w-4xl mx-auto">
            Nurturing minds, building futures. We provide comprehensive education that prepares students for success in an ever-changing world.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
                Access Portal
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-20 bg-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Sree Sai School?
            </h3>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              We offer a comprehensive educational experience that goes beyond academics
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <Card className="text-center p-4 sm:p-6">
              <CardHeader>
                <GraduationCap className="h-10 w-10 sm:h-12 sm:w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle className="text-lg sm:text-xl">Quality Education</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm sm:text-base">
                  CBSE curriculum with experienced faculty and modern teaching methods
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center p-4 sm:p-6">
              <CardHeader>
                <Users className="h-10 w-10 sm:h-12 sm:w-12 text-green-600 mx-auto mb-4" />
                <CardTitle className="text-lg sm:text-xl">Small Class Sizes</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm sm:text-base">
                  Personalized attention with student-teacher ratio of 15:1
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center p-4 sm:p-6">
              <CardHeader>
                <BookOpen className="h-10 w-10 sm:h-12 sm:w-12 text-purple-600 mx-auto mb-4" />
                <CardTitle className="text-lg sm:text-xl">Holistic Development</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm sm:text-base">
                  Focus on academics, sports, arts, and character building
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center p-4 sm:p-6">
              <CardHeader>
                <Trophy className="h-10 w-10 sm:h-12 sm:w-12 text-yellow-600 mx-auto mb-4" />
                <CardTitle className="text-lg sm:text-xl">Proven Results</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm sm:text-base">
                  98% pass rate with excellent board exam results
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div>
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
                About Our School
              </h3>
              <p className="text-base sm:text-lg text-gray-600 mb-4 sm:mb-6">
                Established in 1995, Sree Sai English Medium High School has been a cornerstone of quality education in our community. We serve students from kindergarten through grade 12, providing a nurturing environment where every child can thrive.
              </p>
              <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8">
                Our mission is to develop well-rounded individuals who are academically excellent, morally upright, and socially responsible. We believe in fostering creativity, critical thinking, and character development.
              </p>
              <ul className="space-y-2 sm:space-y-3 text-sm sm:text-base text-gray-600">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                  CBSE Affiliated School
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                  Modern Infrastructure & Facilities
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                  Experienced & Qualified Faculty
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                  Strong Parent-School Partnership
                </li>
              </ul>
            </div>
            <div className="bg-gradient-to-br from-blue-100 to-green-100 p-6 sm:p-8 rounded-lg">
              <h4 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Quick Facts</h4>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm sm:text-base text-gray-600">Established:</span>
                  <span className="font-semibold text-sm sm:text-base">1995</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm sm:text-base text-gray-600">Students:</span>
                  <span className="font-semibold text-sm sm:text-base">1,200+</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm sm:text-base text-gray-600">Faculty:</span>
                  <span className="font-semibold text-sm sm:text-base">80+</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm sm:text-base text-gray-600">Grades:</span>
                  <span className="font-semibold text-sm sm:text-base">K-12</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm sm:text-base text-gray-600">Board:</span>
                  <span className="font-semibold text-sm sm:text-base">CBSE</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-12 sm:py-20 bg-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Get In Touch
            </h3>
            <p className="text-lg sm:text-xl text-gray-600">
              We'd love to hear from you. Contact us for admissions or any queries.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <Card className="text-center p-4 sm:p-6">
              <CardHeader>
                <Phone className="h-8 w-8 sm:h-10 sm:w-10 text-blue-600 mx-auto mb-4" />
                <CardTitle className="text-lg sm:text-xl">Phone</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm sm:text-base text-gray-600">+91 98765 43210</p>
                <p className="text-sm sm:text-base text-gray-600">+91 98765 43211</p>
              </CardContent>
            </Card>

            <Card className="text-center p-4 sm:p-6">
              <CardHeader>
                <Mail className="h-8 w-8 sm:h-10 sm:w-10 text-green-600 mx-auto mb-4" />
                <CardTitle className="text-lg sm:text-xl">Email</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm sm:text-base text-gray-600">info@sreesaischool.edu</p>
                <p className="text-sm sm:text-base text-gray-600">admissions@sreesaischool.edu</p>
              </CardContent>
            </Card>

            <Card className="text-center p-4 sm:p-6">
              <CardHeader>
                <MapPin className="h-8 w-8 sm:h-10 sm:w-10 text-purple-600 mx-auto mb-4" />
                <CardTitle className="text-lg sm:text-xl">Address</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm sm:text-base text-gray-600">
                  123 Education Street<br />
                  Knowledge City, State 560001
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-4 sm:mb-6">
            <School className="h-6 w-6 sm:h-8 sm:w-8" />
            <h4 className="text-lg sm:text-xl font-bold">Sree Sai English Medium High School</h4>
          </div>
          <p className="text-sm sm:text-base text-gray-300 mb-4">
            Excellence in Education Since 1995
          </p>
          <p className="text-xs sm:text-sm text-gray-400">
            © 2024 Sree Sai English Medium High School. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};
