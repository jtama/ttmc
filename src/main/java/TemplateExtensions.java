import io.quarkiverse.roq.frontmatter.runtime.model.DocumentPage;
import io.quarkiverse.roq.frontmatter.runtime.model.RoqCollection;
import io.quarkus.qute.TemplateExtension;

import java.text.Collator;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.stream.Stream;

public class TemplateExtensions {

    @TemplateExtension
    public static DocumentPage getFirstModule(RoqCollection collection) {
        return alphabetical(collection).getFirst();
    }

    @TemplateExtension
    public static List<DocumentPage> alphabetical(RoqCollection collection) {
       return alphabeticalAsStream(collection).toList();
    }

    private static Stream<DocumentPage> alphabeticalAsStream(RoqCollection collection) {
        Collator collator = Collator.getInstance(Locale.FRENCH);
        collator.setStrength(Collator.PRIMARY);
        return collection.stream()
                .sorted(Comparator.comparing(DocumentPage::title, collator)
                        .thenComparing(DocumentPage::id));
    }

}
