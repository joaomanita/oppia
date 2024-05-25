// Copyright 2021 The Oppia Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Unit tests for the Language Selector Modal component.
 */

import {EventEmitter} from '@angular/core';
import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {I18nLanguageCodeService} from 'services/i18n-language-code.service';
import {LanguageSelectorModalComponent} from 'pages/library-page/search-selectors/language-selector-modal.component';
import {FormsModule} from '@angular/forms';
import {MockTranslatePipe} from 'tests/unit-test-utils';
import {TranslateService} from '@ngx-translate/core';
import {MaterialModule} from 'modules/material.module';
import {SearchService} from 'services/search.service';
import {ConstructTranslationIdsService} from 'services/construct-translation-ids.service';
import {LanguageUtilService} from 'domain/utilities/language-util.service';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {AppConstants} from 'app.constants';

interface SearchDropDownCategories {
  id: string;
  text: string;
}

class MockTranslateService {
  onLangChange: EventEmitter<string> = new EventEmitter();

  instant(key: string, interpolateParams?: Object): string {
    return key;
  }
}

describe('language-selector-modal component', () => {
  let i18nLanguageCodeService: I18nLanguageCodeService;
  let translateService: TranslateService;
  let component: LanguageSelectorModalComponent;
  let searchService: SearchService;
  let constructTranslationIdsService: ConstructTranslationIdsService;
  let languageUtilService: LanguageUtilService;
  let fixture: ComponentFixture<LanguageSelectorModalComponent>;
  let preferredLanguageCodesLoadedEmitter = new EventEmitter();
  let selectionDetailsStub: SelectionDetails;
  let ngbActiveModal: NgbActiveModal;

  const searchDropdownCategories = (): SearchDropDownCategories[] => {
    return AppConstants.SEARCH_DROPDOWN_CATEGORIES.map(categoryName => {
      return {
        id: categoryName,
        text: constructTranslationIdsService.getLibraryId(
          'categories',
          categoryName
        ),
      };
    });
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, FormsModule, MaterialModule],
      declarations: [LanguageSelectorModalComponent, MockTranslatePipe],
      providers: [
        {
          provide: TranslateService,
          useClass: MockTranslateService,
        },
        NgbActiveModal,
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    selectionDetailsStub = {
      categories: {
        description: 'description',
        itemsName: 'categories',
        masterList: [
          {
            id: 'id',
            text: 'category 1',
          },
          {
            id: 'id_2',
            text: 'category 2',
          },
          {
            id: 'id_3',
            text: 'category 3',
          },
        ],
        selections: {id: true, id_2: true, id_3: true},
        numSelections: 0,
        summary: 'all categories',
      },
      languageCodes: {
        description: 'English',
        itemsName: 'languages',
        masterList: [
          {
            id: 'en',
            text: 'English',
          },
          {
            id: 'es',
            text: 'Spanish',
          },
        ],
        numSelections: 1,
        selections: {en: true},
        summary: 'English',
      },
    };

    fixture = TestBed.createComponent(LanguageSelectorModalComponent);
    component = fixture.componentInstance;
    i18nLanguageCodeService = TestBed.inject(I18nLanguageCodeService);
    spyOnProperty(
      i18nLanguageCodeService,
      'onPreferredLanguageCodesLoaded'
    ).and.returnValue(preferredLanguageCodesLoadedEmitter);
    translateService = TestBed.inject(TranslateService);
    searchService = TestBed.inject(SearchService);
    languageUtilService = TestBed.inject(LanguageUtilService);
    constructTranslationIdsService = TestBed.inject(
      ConstructTranslationIdsService
    );
    ngbActiveModal = TestBed.inject(NgbActiveModal);
    component.ngOnInit();
    fixture.detectChanges();
  });

  it('should update selection details if there are no selections', () => {
    spyOn(translateService, 'instant').and.returnValue('key');
    component.updateSelectionDetails('languageCodes');
    let selectionDetails = component.selectionDetails;
    expect(selectionDetails.categories.numSelections).toEqual(0);
  });

  it(
    'should update selection details if selected languages' +
      ' are greater than zero',
    () => {
      expect(component.selectionDetails.languageCodes.description).toEqual(
        'I18N_LIBRARY_ALL_LANGUAGES_SELECTED'
      );
      searchService.selectionDetails = selectionDetailsStub;
      spyOn(translateService, 'instant').and.returnValue('English');
      component.updateSelectionDetails('languageCodes');
      expect(component.selectionDetails.languageCodes.description).toEqual(
        'English'
      );
    }
  );

  it('should initialize', () => {
    spyOn(component, 'updateSelectionDetails');
    component.ngOnInit();
    expect(component.updateSelectionDetails).toHaveBeenCalled();
  });

  it('should detect selections', () => {
    spyOn(component, 'updateSelectionDetails');

    searchService.selectionDetails = {
      categories: {
        description: '',
        itemsName: 'categories',
        masterList: searchDropdownCategories(),
        numSelections: 0,
        selections: {},
        summary: '',
      },
      languageCodes: {
        description: '',
        itemsName: 'languages',
        masterList: languageUtilService.getLanguageIdsAndTexts(),
        numSelections: 0,
        selections: {},
        summary: '',
      },
    };

    component.toggleSelection('languageCodes', 'Filipino');
    component.updateSelectionDetails('languageCodes');
    expect(
      component.selectionDetails.languageCodes.selections.Filipino
    ).toEqual(true);
    component.toggleSelection('languageCodes', 'Filipino');
    expect(
      component.selectionDetails.languageCodes.selections.Filipino
    ).toEqual(false);
  });

  it('should apply filters on close', () => {
    const dismissSpy = spyOn(ngbActiveModal, 'dismiss').and.callThrough();
    spyOn(searchService, 'triggerSearch');
    component.toggleSelection('languageCodes', 'en');
    component.closeModal();
    expect(searchService.triggerSearch).toHaveBeenCalled();
    expect(dismissSpy).toHaveBeenCalled();
  });
});
