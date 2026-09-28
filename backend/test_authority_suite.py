import asyncio
from httpx import AsyncClient
from main import app

async def run_full_suite():
    async with AsyncClient(app=app, base_url='http://test') as ac:
        print('=== 1. TEST AUTHORITY LOGIN ===')
        login_res = await ac.post('/api/auth/login', json={'email': 'authority@marine-ai.io', 'password': 'authority2026'})
        assert login_res.status_code == 200, f'Login failed: {login_res.text}'
        auth_data = login_res.json()
        token = auth_data['token']
        user = auth_data['user']
        print(f"Logged in as: {user['name']} | Role: {user['role']} | Station: {user['base_port']}")
        assert user['role'] == 'authority'

        headers = {'Authorization': f'Bearer {token}'}

        print('\n=== 2. TEST FISHER ROLE ACCESS RESTRICTION (HTTP 403) ===')
        fisher_login = await ac.post('/api/auth/login', json={'email': 'demo@marine-ai.io', 'password': 'marineai2026'})
        fisher_token = fisher_login.json()['token']
        fisher_headers = {'Authorization': f'Bearer {fisher_token}'}
        forbidden_res = await ac.get('/api/authority/overview', headers=fisher_headers)
        assert forbidden_res.status_code == 403, f'Expected 403, got {forbidden_res.status_code}'
        print('Fisher correctly rejected with HTTP 403 Forbidden.')

        print('\n=== 3. TEST UNAUTHENTICATED ACCESS RESTRICTION (HTTP 401) ===')
        ac.cookies.clear()
        unauth_res = await ac.get('/api/authority/overview')
        assert unauth_res.status_code == 401, f'Expected 401, got {unauth_res.status_code}'
        print('Unauthenticated request correctly rejected with HTTP 401.')

        print('\n=== 4. TEST TACTICAL OVERVIEW API ===')
        ov_res = await ac.get('/api/authority/overview', headers=headers)
        assert ov_res.status_code == 200
        ov = ov_res.json()
        print('Active Hazard:', ov['hazard']['name'])
        print('Category:', ov['hazard']['category_name'])
        print('Coordinates:', ov['hazard']['current_lat'], ov['hazard']['current_lon'])
        print('Speed & Direction:', ov['hazard']['current_speed_knots'], 'knots @', ov['hazard']['direction_text'])
        print('Pressure:', ov['hazard']['central_pressure_hpa'], 'hPa')
        print('Wind & Wave:', ov['hazard']['max_sustained_wind_kmh'], 'km/h,', ov['hazard']['significant_wave_height_m'], 'm')
        print('Composite Risk Score:', ov['risk_index']['score'], '/ 100 [', ov['risk_index']['severity'], ']')
        print('Risk Breakdown Weights:', ov['risk_index']['factors']['weights'])
        assert ov['risk_index']['score'] >= 70

        print('\n=== 5. TEST ACTIVE VS NEXT PREDICTED IMPACT ZONES ===')
        active_z = ov['active_impact_zone']
        next_z = ov['next_predicted_zone']
        print('Active Impact Zone:', active_z['zone_name'], '| ETA:', active_z['eta_hours'], 'hrs | Warning:', active_z['harbor_warning_signal'])
        print('Next Predicted Zone:', next_z['zone_name'], '| ETA:', next_z['eta_hours'], 'hrs | Warning:', next_z['harbor_warning_signal'])
        assert active_z['zone_type'] == 'ACTIVE_IMPACT'
        assert next_z['zone_type'] == 'NEXT_PREDICTED'

        print('\n=== 6. TEST FLEET DISTRESS & RESCUE ASSETS ===')
        vessels = ov['vessels']
        distress = [v for v in vessels if v['category'] == 'CRITICAL_DISTRESS']
        print(f"Total Tracked Vessels: {len(vessels)} | Critical Distress: {len(distress)}")
        for d in distress:
            print(f"  - SOS Craft: {d['vessel_name']} ({d['registration']}) | Crew: {d['crew_count']} | Distance: {d['distance_to_hazard_nm']} NM | Reason: {d['distress_reason']}")

        resources = ov['rescue_resources']
        print(f"Total Rescue Resources: {len(resources)}")
        for r in resources:
            print(f"  - Asset: {r['asset_name']} | Base: {r['base_station']} | Status: {r['status']} | ETA: {r['response_eta_min']} min")

        print('\n=== 7. TEST DIRECTIVE APPROVAL ACTION ===')
        recs = ov['recommendations']
        pending_rec = next((r for r in recs if r['status'] == 'PENDING_APPROVAL'), recs[0])
        appr_res = await ac.post(f"/api/authority/recommendations/{pending_rec['id']}/approve", headers=headers, json={'officer_notes': 'Command Approved'})
        assert appr_res.status_code == 200
        print('Successfully authorized directive:', appr_res.json())

        print('\n=== 8. TEST 12-AGENT ORCHESTRATION PIPELINE ===')
        pipe_res = await ac.post('/api/authority/pipeline/run?trigger=AUTOMATED_VERIFICATION', headers=headers)
        assert pipe_res.status_code == 200
        pipe = pipe_res.json()
        print('Pipeline Duration:', pipe['total_duration_ms'], 'ms | Total Agents Executed:', pipe['agents_executed'])
        for agent in pipe['agent_logs']:
            print(f"  [OK] {agent['agent']} ({agent['duration_ms']} ms): {agent['output_summary'][:70]}...")
        assert pipe['agents_executed'] == 12

        print('\n=== 9. TEST CONTEXTUAL AUTHORITY MARINE AI QUERY ===')
        ai_res = await ac.post('/api/authority/query', headers=headers, json={'query': 'Which vessel is in critical distress and what SAR asset is dispatched?'})
        assert ai_res.status_code == 200
        print('Authority AI Response:\n', ai_res.json()['response'])

        print('\n=============================================')
        print('>>> ALL 9 ACCEPTANCE TESTS PASSED WITH 100% SUCCESS! <<<')
        print('=============================================')

if __name__ == '__main__':
    asyncio.run(run_full_suite())
