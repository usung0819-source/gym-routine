# 운동 시범 영상

- 만든 곳: Google Flow (Veo 3.1 Lite), 앱 운영자 계정에서 생성한 AI 영상입니다. 실제 인물이 아닙니다.
- 영상 오른쪽 아래의 "Veo" 표시는 Google이 넣는 AI 생성 표시이며 지우지 않습니다.
- `<운동>.mp4`: 방법 화면과 운동 카드에서 반복 재생하는 영상 (원본 앞 6초, 640px).
- `<운동>-sync.mp4`: 운동 진행 화면용. 시작 자세 → 끝 자세 한 번만 담았고, 앱이 숫자 박자에 맞춰 재생 위치를 맞춥니다(모든 프레임 키프레임).
- `<운동>.jpg`: 영상을 불러오기 전에 보이는 정지 화면.

검수: 1초 간격 프레임을 앱의 운동 설명·주의사항과 대조한 뒤 넣었습니다.

스트레칭(hamstring, hipflexor, calfstretch)은 한쪽만 촬영했습니다. 영상에 나온 쪽: 허벅지 뒤=왼쪽 다리, 허벅지 앞=오른쪽 다리(뒤쪽 무릎), 종아리=오른쪽 다리(뒤쪽 다리). 반대쪽 단계에서는 앱이 영상을 좌우 반전해서 보여줍니다.

준비운동: catcow는 평평한 등 → 둥근 등 한 구간(진행 화면에서 박자에 맞춰 왕복). shoulderroll은 어깨를 뒤로 돌리는 한 바퀴(약 2.6초)를 그대로 반복 재생합니다(-sync 파일 없음).

테스트용(관리자에게만 보임, "테스트" 표시): abduct, adduct, hacksquat, curlup, sideplank, deadbug, cheststretch, hipcircle. 자세가 앱 설명과 맞지 않는 영상이라 일반 사용자에게는 나오지 않습니다.

v1.20.0 추가(정식): lateral, shoulderpress, pecdeck, legext, inclinepress(좌우 반전해 오른쪽을 보게 함), calfmachine, calfraise(Veo 3.1 Fast로 다시 만든 영상), pallof(케이블이 몸 오른쪽인 모습, '왼쪽' 차례에 좌우 반전). hacksquat 테스트 영상은 일어서는 장면을 거꾸로 돌려 서 있는 자세 → 앉은 자세 순서로 맞췄습니다.


v1.21.0: 유산소 반복 영상(run, treadmill, elliptical, bike, march, outwalk, outrun — 한 동작 주기를 잘라 반복, 야외는 끝과 처음을 0.5초 겹쳐 이음). hacksquat·backext·reardelt 정식(다시 만든 영상), adduct 테스트 영상 교체.
`v/<운동>-<방향>-1.jpg`, `-2.jpg`: 확대 화면 "다른 방향에서 보기 (사진)"의 시작·끝 자세 사진(Nano Banana Pro). chairsquat(앞), pulldown(옆).

v1.22.0: Omni 1.2 Flash로 다시 만든 영상. 정식: deadbug(오른팔·왼다리, 반대쪽 차례에 좌우 반전), abduct. 테스트 영상 교체: curlup(손이 몸 옆), cheststretch(오른팔, 팔이 어깨 높이), hipcircle(정면이라 원 확인 불가). sideplank(손바닥으로 짚음)·adduct는 그대로 테스트.

v1.23.0: 정식: adduct(패드가 무릎 안쪽, 벌린 자세→모음), cheststretch(오른팔을 어깨보다 낮게 벽에 대고 몸통을 돌림). 시작·끝 사진을 Nano Banana Pro로 새로 만든 뒤 Omni 1.2 Flash로 제작.

v1.24.0: 정식: sideplank(오른쪽 팔꿈치·무릎을 바닥에 대고 엉덩이를 듦, 원본 44~84프레임. 끝 자세에서 위쪽 무릎이 약간 벌어짐).
