import type { Metadata } from "next";
import { LegalPageLayout, LegalSection } from "@/components/LegalPageLayout";

export const metadata: Metadata = {
  title: "개인정보처리방침 | MindToDo",
};

export default function PrivacyPage() {
  return (
    <LegalPageLayout title="개인정보처리방침" dateLabel="공고일자: 2026년 09월 25일 · 시행일자: 2026년 09월 25일 · 최종 수정일: 2026년 10월 31일">
      <p>
        MindToDo(&quot;서비스&quot;)는 이용자의 개인정보를 중요하게 생각하며, 「개인정보 보호법」 등 관련
        법령을 준수합니다. 본 방침은 서비스가 어떤 정보를 어떻게 처리하는지 설명합니다.
      </p>

      <LegalSection heading="1. 수집하는 개인정보 항목 및 수집 방법">
        <p>
          서비스는 <strong>별도의 회원가입 절차 없이 Google 계정 로그인만으로</strong> 이용됩니다.
        </p>
        <ul className="flex list-disc flex-col gap-2 pl-5">
          <li>
            <strong>운영자가 저장하지 않는 정보</strong>: 서비스는 할 일 데이터를 보관하기 위한 별도의
            데이터베이스를 사용하지 않습니다. 마인드맵과 Google Tasks 데이터는 브라우저 메모리에서
            처리하며, 운영자의 서버로 전송하여 저장하지 않습니다. 이용자가 Google Tasks에 반영한
            데이터는 Google 서버에 저장됩니다. 서비스는 Google 프로필의 이름이나 이메일을 조회하는
            API를 호출하지 않습니다.
          </li>
          <li>
            <strong>로그인 유지를 위한 정보(갱신 토큰)</strong>: 로그인 시 Google이 발급하는 갱신
            토큰(refresh token)을 운영자의 서버가 AES-256-GCM 방식으로 암호화하여 이용자의 브라우저에
            쿠키로만 저장합니다. 암호화된 토큰 값은 운영자의 데이터베이스나 로그에 별도로 저장하지
            않으며, 로그인을 유지하기 위한 목적으로 서버가 일시적으로 처리합니다. 이 쿠키는 최대
            30일간 보관되며, 서비스를 이용할 때마다 보관 기간이 연장됩니다. 로그아웃하거나 Google
            계정에서 접근 권한을 철회하면 쿠키가 삭제되거나 더 이상 사용할 수 없게 됩니다.
          </li>
          <li>
            <strong>일시적으로 처리하는 정보(접근 토큰)</strong>: 로그인 또는 로그인 유지 과정에서
            Google이 발급하는 접근 토큰(access token)을 브라우저 메모리에 일시적으로 보관합니다. 토큰은
            Google Tasks API 인증을 위해 Google에 전송되며, 운영자의 서버나 브라우저의 로컬 저장소에는
            저장하지 않습니다. 앱에서 로그아웃하거나 Google이 지정한 유효기간이 만료되면 앱이 보관한
            토큰을 제거합니다.
          </li>
          <li>
            <strong>Google Tasks 데이터</strong>: 서비스는 목록 이름과 ID, 할 일의 ID·제목·메모·기한·완료
            상태·상위 할 일 관계·정렬 정보를 조회하거나 처리합니다. 로그인 후 목록을 조회하며,
            이용자가 &quot;가져오기&quot;를 누르거나 목록을 선택하면 이용자 본인의
            Google Tasks 데이터를 조회하여 브라우저 화면에만 표시하고, &quot;내보내기&quot;를 누르면
            이용자가 편집한 내용을 이용자 본인의 Google Tasks 계정에 반영합니다. 이 과정은 이용자의
            브라우저와 Google 서버 간에 직접 이루어지며, 운영자의 서버를 거치지 않습니다.
          </li>
        </ul>
      </LegalSection>

      <LegalSection heading="2. 개인정보의 처리 목적">
        <p>
          서비스는 이용자가 요청한 마인드맵-Google Tasks 동기화 기능을 제공하기 위한 목적으로만 Google
          계정 접근 권한을 사용하며, 그 외의 목적(광고, 마케팅, 데이터 판매 등)으로 이용자의 데이터를
          처리하지 않습니다.
        </p>
        <p>
          요청하는 권한은 Google Tasks의 읽기·쓰기 권한
          (<code className="break-all">https://www.googleapis.com/auth/tasks</code>)입니다. 목록과 할 일을 조회하고,
          이용자의 조작에 따라 목록을 생성·이름 변경·삭제하거나 편집한 할 일을 Google Tasks에
          반영하기 위해 사용합니다.
        </p>
        <p>
          <strong>내보내기는 선택한 Google Tasks 목록의 기존 할 일을 삭제한 뒤 현재 마인드맵의
          내용으로 다시 생성합니다.</strong> 이 과정에서 할 일 ID, 완료 시각 등 기존 메타데이터가
          초기화될 수 있으며, 실행 전 확인 화면을 표시합니다. 마인드맵의 편집 내용은 자동으로
          Google Tasks에 저장되지 않습니다.
        </p>
      </LegalSection>

      <LegalSection heading="3. Google 사용자 데이터 정책 준수">
        <p>
          본 서비스의 Google 사용자 데이터 사용 및 전송은{" "}
          <a
            href="https://developers.google.com/terms/api-services-user-data-policy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 hover:underline dark:text-indigo-400"
          >
            Google API 서비스 사용자 데이터 정책
          </a>
          (Limited Use 요건 포함)을 준수합니다. 서비스는 Google Tasks API를 통해 얻은 데이터를 이용자에게
          제공되는 서비스 기능(마인드맵 표시 및 동기화) 이외의 목적으로 사용하지 않으며, 제3자에게
          판매하지 않고, 광고 목적으로 사용하지 않습니다. 운영자는 Google Tasks의 내용을 직접
          열람하지 않으며, Google 사용자 데이터를 AI 또는 머신러닝 모델의 개발·학습에 사용하지 않습니다.
        </p>
      </LegalSection>

      <LegalSection heading="4. 개인정보의 보유 및 이용 기간">
        <p>
          운영자는 할 일 데이터와 접근 토큰, 갱신 토큰 원문을 별도의 서버나 데이터베이스에 보관하지
          않습니다. 브라우저 메모리에 있는 편집 내용과 작업 이력은 페이지를 새로고침하거나 닫으면 더
          이상 앱에서 유지되지 않습니다. 브라우저나 운영체제의 세션 복원 기능에 따른 동작은 다를 수
          있습니다. 접근 토큰은 Google이 반환한 유효기간에 따라 관리하며, 앱 로그아웃이나 만료 시 앱에서
          제거합니다.
        </p>
        <p>
          로그인 유지를 위해 이용자의 브라우저에 저장되는 암호화된 갱신 토큰 쿠키는 최대 30일간
          보관되며, 서비스를 이용할 때마다(토큰 갱신 시) 보관 기간이 연장됩니다. 로그아웃하거나
          Google 계정에서 접근 권한을 철회하면 쿠키가 삭제되거나 더 이상 사용할 수 없게 됩니다.
        </p>
        <p>
          Google Tasks에 저장된 데이터는 앱 로그아웃, 페이지 종료 또는 접근 권한 철회만으로 삭제되지
          않습니다. 이용자는 Google Tasks에서 직접 삭제하거나 서비스의 목록 삭제 기능을 사용할 수
          있습니다. Google 서버에서의 보관과 삭제 처리는 Google의 정책에 따릅니다.
        </p>
      </LegalSection>

      <LegalSection heading="5. 데이터 전송 및 공유">
        <p>
          서비스는 로그인 및 로그인 유지를 위해 운영자의 서버가 Google과 OAuth 인증(토큰 발급·갱신)을
          처리합니다. 이 과정에서 발급되는 갱신 토큰은 운영자의 서버에서 암호화된 뒤 이용자의 브라우저에
          쿠키로 저장되며, 운영자의 데이터베이스나 로그에는 남기지 않습니다. Google Tasks 기능 자체는
          이용자의 브라우저에서 Google API로 접근 토큰과 요청 데이터를 직접 전송하여 제공되며, 운영자의
          서버를 거치지 않습니다. 운영자는 Google 사용자 데이터를 판매하거나 광고 사업자 등 다른
          제3자에게 전달하지 않습니다.
        </p>
        <p>
          웹사이트 제공 과정에서 호스팅 제공자와 Google은 IP 주소, 브라우저 정보 등 접속에 필요한
          기술 정보를 처리할 수 있습니다. 앞서 설명한 할 일·토큰의 운영자 서버 미저장은 이러한
          웹사이트 접속 처리나 제공자의 기술 로그까지 전혀 존재하지 않는다는 의미는 아닙니다.
          Google의 정보 처리에 관한 내용은{' '}
          <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer"
            className="text-indigo-600 hover:underline dark:text-indigo-400">
            Google 개인정보처리방침
          </a>
          을 참고해 주세요.
        </p>
      </LegalSection>

      <LegalSection heading="6. 쿠키 및 로컬 저장소 사용">
        <p>
          서비스는 로그인 상태를 유지하기 위해 암호화된 쿠키 하나를 사용합니다. 이 쿠키에는 서비스가
          Google과 통신하기 위해 필요한 암호화된 갱신 토큰만 들어 있으며, 이용자를 식별·추적하거나
          광고 목적으로 사용되지 않습니다. 다만 테마(라이트/다크)와 언어 설정(한국어/영어) 같은 단순
          UI 환경설정은 이용자의 브라우저 로컬 저장소(localStorage)에 저장되며, 서비스가 이를 운영자
          서버로 전송하거나 개인 식별에 사용하지 않습니다. 이용자는 브라우저의 사이트 데이터 삭제
          기능으로 이 쿠키와 환경설정을 삭제할 수 있습니다. Google 로그인 과정에서 Google이 사용하는
          쿠키는 Google의 정책과 이용자의 브라우저 설정에 따릅니다.
        </p>
      </LegalSection>

      <LegalSection heading="7. 이용자의 권리">
        <p>
          이용자는 언제든지{" "}
          <a
            href="https://myaccount.google.com/permissions"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 hover:underline dark:text-indigo-400"
          >
            Google 계정 보안 설정
          </a>
          에서 서비스의 Google Tasks 접근 권한을 철회할 수 있습니다. 권한을 철회하면 서비스는 더 이상
          이용자의 Google Tasks에 접근할 수 없습니다.
        </p>
        <p>
          앱의 로그아웃을 실행하면 브라우저에 보관된 접근 토큰을 제거하고, 서버에 저장된 암호화된
          갱신 토큰 쿠키를 삭제하며, Google에 해당 갱신 토큰의 폐기(revoke)를 요청합니다. 다만 이
          폐기 요청이 일시적인 오류로 처리되지 않을 수 있으므로, 권한을 확실히 철회하려면 위 Google
          계정 설정에서 MindToDo 연결을 직접 해제해 주세요. 데이터 처리에 관한 문의는 아래 이메일로
          요청할 수 있습니다. 운영자가 보관하지 않는 Google Tasks 원본 데이터는 이용자가 Google
          Tasks에서 직접 관리해야 합니다.
        </p>
        <p>
          마인드맵을 복사하는 기능을 사용하면 선택한 내용이 기기의 클립보드에 기록됩니다.
          복사한 내용과 다른 앱에 붙여넣은 사본은 이용자가 해당 기기와 앱에서 관리해야 합니다.
        </p>
      </LegalSection>

      <LegalSection heading="8. Google 사용자 데이터의 보호">
        <p>
          서비스와 Google API 간 통신에는 HTTPS를 사용합니다. 로그인 유지를 위한 갱신 토큰은
          AES-256-GCM 방식으로 암호화한 뒤 httpOnly, Secure(운영 환경), SameSite=Lax 속성이 설정된
          쿠키로만 저장하여 자바스크립트나 다른 사이트에서 직접 읽을 수 없도록 합니다. 접근 토큰은
          브라우저 메모리에서만 관리하고 로컬 저장소에 영구 저장하지 않으며, 운영자 서버에는 할 일
          데이터나 토큰 원문을 저장하지 않는 방식으로 보관 범위를 줄입니다. 공용 기기에서는 이용 후
          로그아웃하고 서비스 페이지를 닫아 주세요.
        </p>
      </LegalSection>

      <LegalSection heading="9. 만 14세 미만 아동의 개인정보">
        <p>서비스는 만 14세 미만 아동을 대상으로 하지 않으며, 아동의 개인정보를 의도적으로 수집하지 않습니다.</p>
      </LegalSection>

      <LegalSection heading="10. 개인정보 보호책임자 및 문의처">
        <p>서비스 이용 및 개인정보 처리와 관련한 문의사항은 아래로 연락해 주시기 바랍니다.</p>
        <ul className="flex flex-col gap-1 pl-5">
          <li>
            <strong>운영자</strong>: 공간이레
          </li>
          <li>
            <strong>이메일</strong>: space.yireh@gmail.com
          </li>
        </ul>
      </LegalSection>

      <LegalSection heading="11. 고지의 의무">
        <p>
          이 개인정보처리방침은 법령·정책 또는 서비스 내용의 변경에 따라 개정될 수 있으며, 개정 시 서비스
          내 공지사항을 통해 고지합니다.
        </p>
      </LegalSection>

      <p className="pt-4 text-slate-500 dark:text-slate-400">
        공고일자: 2026년 09월 25일
        <br />
        시행일자: 2026년 09월 25일
        <br />
        최종 수정일: 2026년 10월 31일
      </p>
    </LegalPageLayout>
  );
}
