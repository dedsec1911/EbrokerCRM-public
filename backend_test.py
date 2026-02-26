import requests
import sys
from datetime import datetime

class EstateFlowAPITester:
    def __init__(self, base_url="http://localhost:8001/api"):
        self.base_url = base_url
        self.admin_token = None
        self.agent_token = None
        self.test_property_id = None
        self.tests_run = 0
        self.tests_passed = 0

    def run_test(self, name, method, endpoint, expected_status, data=None, token=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        if token:
            headers['Authorization'] = f'Bearer {token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return True, response.json()
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    print(f"   Response: {response.json()}")
                except:
                    print(f"   Response: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_admin_login(self):
        """Test admin login"""
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "auth/login",
            200,
            data={"identifier": "admin@estateflow.com", "password": "admin123"}
        )
        if success and 'token' in response:
            self.admin_token = response['token']
            print(f"   Admin role: {response.get('user', {}).get('role', 'Unknown')}")
            return True
        return False

    def test_agent_login(self):
        """Test agent login"""
        success, response = self.run_test(
            "Agent Login",
            "POST",
            "auth/login",
            200,
            data={"identifier": "rakesh@estateflow.com", "password": "agent123"}
        )
        if success and 'token' in response:
            self.agent_token = response['token']
            print(f"   Agent role: {response.get('user', {}).get('role', 'Unknown')}")
            return True
        return False

    def test_auth_me_admin(self):
        """Test /auth/me endpoint with admin token"""
        success, response = self.run_test(
            "Get Admin Profile",
            "GET",
            "auth/me",
            200,
            token=self.admin_token
        )
        return success

    def test_auth_me_agent(self):
        """Test /auth/me endpoint with agent token"""
        success, response = self.run_test(
            "Get Agent Profile",
            "GET",
            "auth/me",
            200,
            token=self.agent_token
        )
        return success

    def test_agent_create_property(self):
        """Test property creation by agent"""
        property_data = {
            "property_type": "Apartment",
            "bhk": "2BHK",
            "furnishing": "Semi-Furnished",
            "rent": "25000",
            "deposit": "75000",
            "tenant_type": "Family",
            "possession": "Ready to move",
            "building": "Test Building",
            "location": "Test Location, Mumbai",
            "agent_name": "Test Agent",
            "agent_contact": "9876543210",
            "description": "Test property for automated testing"
        }
        
        success, response = self.run_test(
            "Agent Create Property",
            "POST",
            "properties",
            200,
            data=property_data,
            token=self.agent_token
        )
        
        if success and 'id' in response:
            self.test_property_id = response['id']
            print(f"   Created property ID: {self.test_property_id}")
            return True
        return False

    def test_get_properties_agent(self):
        """Test get properties for agent"""
        success, response = self.run_test(
            "Get Properties (Agent)",
            "GET",
            "properties",
            200,
            token=self.agent_token
        )
        
        if success and isinstance(response, list):
            print(f"   Found {len(response)} properties")
            return True
        return False

    def test_get_properties_admin(self):
        """Test get properties for admin"""
        success, response = self.run_test(
            "Get Properties (Admin)",
            "GET",
            "properties",
            200,
            token=self.admin_token
        )
        
        if success and isinstance(response, list):
            print(f"   Found {len(response)} properties")
            return True
        return False

    def test_get_pending_properties(self):
        """Test get pending properties"""
        success, response = self.run_test(
            "Get Pending Properties",
            "GET",
            "properties?status_filter=pending",
            200,
            token=self.admin_token
        )
        
        if success and isinstance(response, list):
            print(f"   Found {len(response)} pending properties")
            return True
        return False

    def test_get_property_details(self):
        """Test get specific property details"""
        if not self.test_property_id:
            print("❌ Skipping - No test property ID available")
            return False
            
        success, response = self.run_test(
            "Get Property Details",
            "GET",
            f"properties/{self.test_property_id}",
            200,
            token=self.agent_token
        )
        
        if success and 'id' in response:
            print(f"   Property status: {response.get('status', 'Unknown')}")
            return True
        return False

    def test_admin_approve_property(self):
        """Test admin approve property"""
        if not self.test_property_id:
            print("❌ Skipping - No test property ID available")
            return False
            
        success, response = self.run_test(
            "Admin Approve Property",
            "POST",
            f"properties/{self.test_property_id}/approve",
            200,
            token=self.admin_token
        )
        return success

    def test_agent_stats(self):
        """Test agent stats endpoint"""
        success, response = self.run_test(
            "Get Agent Stats",
            "GET",
            "stats",
            200,
            token=self.agent_token
        )
        
        if success and isinstance(response, dict):
            print(f"   Stats: Total: {response.get('total_properties', 0)}, Approved: {response.get('approved_properties', 0)}, Pending: {response.get('pending_properties', 0)}, Leads: {response.get('total_leads', 0)}")
            return True
        return False

    def test_admin_stats(self):
        """Test admin stats endpoint"""
        success, response = self.run_test(
            "Get Admin Stats",
            "GET",
            "stats",
            200,
            token=self.admin_token
        )
        
        if success and isinstance(response, dict):
            print(f"   Stats: Total: {response.get('total_properties', 0)}, Approved: {response.get('approved_properties', 0)}, Pending: {response.get('pending_properties', 0)}, Agents: {response.get('total_agents', 0)}")
            return True
        return False

    def test_get_leads(self):
        """Test get leads endpoint"""
        success, response = self.run_test(
            "Get Leads",
            "GET",
            "leads",
            200,
            token=self.agent_token
        )
        
        if success and isinstance(response, list):
            print(f"   Found {len(response)} leads")
            return True
        return False

    def test_whatsapp_message_generation(self):
        """Test WhatsApp message generation"""
        if not self.test_property_id:
            print("❌ Skipping - No test property ID available")
            return False
            
        success, response = self.run_test(
            "WhatsApp Message Generation",
            "POST",
            "whatsapp/generate-message",
            200,
            data={"property_id": self.test_property_id},
            token=self.agent_token
        )
        
        if success and 'message' in response and 'whatsapp_url' in response:
            print(f"   Message generated successfully")
            return True
        return False

    def test_invalid_credentials(self):
        """Test login with invalid credentials"""
        success, response = self.run_test(
            "Invalid Login",
            "POST",
            "auth/login",
            401,
            data={"identifier": "invalid@test.com", "password": "wrongpass"}
        )
        return success

    def test_unauthorized_access(self):
        """Test accessing protected endpoint without token"""
        success, response = self.run_test(
            "Unauthorized Access",
            "GET",
            "properties",
            401
        )
        return success

def main():
    tester = EstateFlowAPITester()
    
    print("🚀 Starting EstateFlow CRM API Testing")
    print("="*50)

    # Authentication Tests
    print("\n📋 AUTHENTICATION TESTS")
    print("-"*30)
    
    if not tester.test_admin_login():
        print("❌ Admin login failed, stopping tests")
        return 1
        
    if not tester.test_agent_login():
        print("❌ Agent login failed, stopping tests")
        return 1

    tester.test_auth_me_admin()
    tester.test_auth_me_agent()
    tester.test_invalid_credentials()
    tester.test_unauthorized_access()

    # Property Management Tests
    print("\n🏢 PROPERTY MANAGEMENT TESTS")
    print("-"*30)
    
    tester.test_agent_create_property()
    tester.test_get_properties_agent()
    tester.test_get_properties_admin()
    tester.test_get_pending_properties()
    tester.test_get_property_details()
    tester.test_admin_approve_property()

    # Stats Tests
    print("\n📊 STATISTICS TESTS")
    print("-"*30)
    
    tester.test_agent_stats()
    tester.test_admin_stats()

    # Leads Tests
    print("\n👥 LEADS MANAGEMENT TESTS")
    print("-"*30)
    
    tester.test_get_leads()

    # WhatsApp Tests
    print("\n📱 WHATSAPP INTEGRATION TESTS")
    print("-"*30)
    
    tester.test_whatsapp_message_generation()

    # Final Results
    print("\n" + "="*50)
    print(f"📊 FINAL RESULTS: {tester.tests_passed}/{tester.tests_run} tests passed")
    
    success_rate = (tester.tests_passed / tester.tests_run) * 100 if tester.tests_run > 0 else 0
    print(f"🎯 Success Rate: {success_rate:.1f}%")
    
    if success_rate >= 90:
        print("🎉 Excellent! Backend APIs are working well")
    elif success_rate >= 70:
        print("✅ Good! Most backend APIs are working")
    elif success_rate >= 50:
        print("⚠️  Warning! Several backend issues need attention")
    else:
        print("❌ Critical! Major backend issues found")

    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())